import { createFileRoute } from "@tanstack/react-router";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "XC — Avaliação Física e Nutricional" },
      { name: "description", content: "Avaliação física e nutricional individual XC" },
      { name: "theme-color", content: "#001020" },
    ],
  }),
  component: App,
});
