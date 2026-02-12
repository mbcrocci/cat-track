import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
return (
  <div className="dark">
    <h1>Hello asdasd World</h1>
  </div>
);
}