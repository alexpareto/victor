import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./routes/App/index.tsx";
import "./index.css";
import { createTheme, MantineProvider } from "@mantine/core";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { Test } from "@/routes/Test";

const theme = createTheme({});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Test />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>,
);
