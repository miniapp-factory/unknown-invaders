"use client";

import { useEffect, useRef, useState } from "react";

const canvasSize = 300;
const cellSize = 10;
const initialSnake = [{ x: 5, y: 5 }];
const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [direction, setDirection] = useState(directions.ArrowRight);
  const [food, setFood] = useState(generateFood(initialSnake));
  const [gameOver, setGameOver] = useState(false);

  function generateFood(exclude: { x: number; y: number }[]) {
    let newFood: { x: number; y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (canvasSize / cellSize)),
        y: Math.floor(Math.random() * (canvasSize / cellSize)),
      };
      if (!exclude.some((p) => p.x === newFood.x && p.y === newFood.y)) break;
    }
    return newFood;
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const newDir = directions[e.key as keyof typeof directions];
      if (newDir) {
        // Prevent reversing direction
        if (
          snake[0].x + newDir.x !== snake[1].x ||
          snake[0].y + newDir.y !== snake[1].y
        ) {
          setDirection(newDir);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [snake]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const newHead = {
          x: prev[0].x + direction.x,
          y: prev[0].y + direction.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.y < 0 ||
          newHead.x >= canvasSize / cellSize ||
          newHead.y >= canvasSize / cellSize
        ) {
          setGameOver(true);
          return prev;
        }

        // Check self collision
        if (prev.some((p) => p.x === newHead.x && p.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];
        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(
      food.x * cellSize,
      food.y * cellSize,
      cellSize,
      cellSize
    );

    // Draw snake
    ctx.fillStyle = "green";
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * cellSize,
        segment.y * cellSize,
        cellSize,
        cellSize
      );
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border border-gray-300"
      />
      {gameOver && (
        <div className="text-xl text-red-600 font-semibold">
          Game Over
        </div>
      )}
    </div>
  );
}
