import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router({ mergeParams: true });

answersRouter.post("/", async (req, res) => {
  const questionId = req.params.questionId;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  if (content.length > 300) {
    return res.status(400).json({ message: "Content exceeds maximum length of 300 characters." });
  }

  try {

    await connectionPool.query(
      `INSERT INTO answers (question_id ,content)
       VALUES ($1, $2)`,
      [questionId, content]
    );
    res.status(201).json({ message: "Answer created successfully." });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Unable to create answer." });
  }
});

answersRouter.get("/", async (req, res) => {
  const questionId = req.params.questionId;
  let result;

  if (!result) {
    return res.status(404).json({ message: "Question not found." });
  }

  try {
    result = await connectionPool.query(
      `SELECT * FROM answers WHERE question_id = $1`,
      [questionId]
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Unable to fetch answers." });
  }
});

answersRouter.delete("/", async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const result = await connectionPool.query(
      `DELETE FROM answers WHERE question_id = $1`,
      [questionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Answer not found." });
    }

    res.status(200).json({message: "All answers for the question has been deleted successfully."});

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Unable to delete answer." });
  }
});

export default answersRouter