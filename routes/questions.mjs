import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionsRouter = Router();

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

questionsRouter.get("/search", async (req, res) => {
  const title = req.query.title;
  const category = req.query.category;
  let result;

  try {
    result = await connectionPool.query(
      `SELECT * FROM questions
       WHERE 
       ($1 IS NULL OR $1 = '' OR title ILIKE '%' || $1 || '%')
       AND
       ($2 IS NULL OR $2 = '' OR category ILIKE '%' || $2 || '%')`,

      [title, category]
    );
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Unable to fetch a question");
  }
});

export default questionsRouter