import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionsRouter = Router();

questionsRouter.get("/search", async (req, res) => {
  const title = req.query.title;
  const category = req.query.category;

  try {
    let q = `SELECT * FROM questions WHERE 1=1`;
    const params = [];
    let i = 1;

    if (title) {
      q += ` AND title ILIKE '%' || $${i} || '%'`;
      params.push(title);
      i++;
    }

    if (category) {
      q += ` AND category ILIKE '%' || $${i} || '%'`;
      params.push(category);
      i++;
    }

    const result = await connectionPool.query(q, params);
    const questions = result.rows;
    res.status(200).json(questions);

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Unable to fetch a question");
  }
});

questionsRouter.post("/", async (req, res) => {
  try {
    const { title, description, category } = req.body;

  if (!req.body.title) {
    return res.status(400).json({"message": "Invalid request data."});
  }

  await connectionPool.query(
    `INSERT INTO questions (title, description, category) 
    VALUES ($1, $2, $3)`,
    [
      title,
      description,
      category,
    ]
  )
  } catch (error) {
    return res.status(500).json({"message": "Unable to create question."});
  }

  return res.status(201).json({"message": "Question created successfully."});
});

questionsRouter.get("/", async (req, res) => {
  let questions;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM questions`
    );
    questions = result.rows;
  } catch (error) {
    console.error({error});
    return res.status(500).json({"message": "Unable to fetch questions."});
  }

  return res.status(200).json(questions);
});

questionsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  let question;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [id]
    );
    question = result.rows[0];
  } catch (error) {
    return res.status(500).json({"message": "Unable to fetch question."});
  }

  if (!question) {
    return res.status(404).json({"message": "Question not found."});
  }

  return res.status(200).json(question);
});

questionsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;
  try {
    const result = await connectionPool.query(
      `UPDATE questions 
      SET title = $1, description = $2, category = $3
      WHERE id = $4`,
      [
        title,
        description,
        category,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({"message": "Question not found."});
    }
  } catch (error) {
    return res.status(500).json({"message": "Unable to fetch question."});
  }

  return res.status(200).json({"message": "Question updated successfully."});
});

questionsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await connectionPool.query(
      `DELETE FROM questions WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({"message": "Question not found."});
    }
  } catch (error) {
    return res.status(500).json({"message": "Unable to delete question."});
  }

  return res.status(200).json({"message": "Question has been deleted successfully."});
});

questionsRouter.put("/:id/answers", async (req, res) => {
  const questionId = req.params.id;
  const updatedQuestion = {...req.body};

  await connectionPool.query(
    `UPDATE answers 
     SET title = $1,
     content = $2
     WHERE question_id = $3`,
    [
      updatedQuestion.title,
      updatedQuestion.content,
      questionId
    ]
  );
});

export default questionsRouter