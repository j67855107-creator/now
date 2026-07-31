import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";

// Layouts
import RootLayout from "../layouts/RootLayout";
import AdminLayout from "../layouts/AdminLayout";
import { AppProvider } from "../contexts/AppContext";
import { Outlet } from "react-router-dom";

const GlobalProvider = () => {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
};


// Pages
import HomePage from "../pages/HomePage";
import ConvertWordPage from "../pages/converters/ConvertWordPage";
import ConvertPDFPage from "../pages/converters/ConvertPDFPage";
import ToolsPage from "../pages/ToolsPage";
import GuidesPage from "../pages/GuidesPage";
import BlogPage from "../pages/BlogPage";
import FAQPage from "../pages/FAQPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import NotFoundPage from "../pages/NotFoundPage";

// Admin
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

import { toolsRegistry } from "../ai/registries/toolsRegistry";

const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || "/admin-login-secret-path";

// ─── Legacy Redirects Handler ──────────────────────────────────
// We handle legacy ?view=*, #tool, and /tools/* patterns
const checkLegacyUrls = (request: Request) => {
  const url = new URL(request.url);
  
  // 1. /tools/* -> /ai-tools (or specific tool if we had sub-paths)
  if (url.pathname.startsWith("/tools")) {
    return redirect("/ai-tools");
  }

  // 2. ?view=*
  const view = url.searchParams.get("view");
  if (view) {
    if (view === "convert-word") return redirect("/converters/word-to-markdown");
    if (view === "convert-pdf") return redirect("/converters/pdf-to-markdown");
    if (view === "tools") return redirect("/ai-tools");
    if (view === "guide") return redirect("/guides");
    const basicPages = ["blog", "faq", "about", "contact", "privacy", "terms", "analytics"];
    if (basicPages.includes(view)) return redirect(`/${view}`);
  }

  // 3. /?tool=id or /#id
  const tool = url.searchParams.get("tool");
  if (tool) {
    const plugin = toolsRegistry.get(tool);
    if (plugin) return redirect(plugin.route);
  }
  
  // Note: hash redirects are harder to handle server-side/loader-side because hashes aren't sent to the server, 
  // but react-router loaders do get the full URL.
  if (url.hash && url.pathname === "/") {
    const hashId = url.hash.replace("#", "");
    const plugin = toolsRegistry.get(hashId);
    if (plugin) return redirect(plugin.route);
  }

  return null;
};

// ─── Router Configuration ──────────────────────────────────────
export const router = createBrowserRouter([
  {
    element: <GlobalProvider />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        loader: async ({ request }) => {
          const redirectResponse = checkLegacyUrls(request);
          if (redirectResponse) return redirectResponse;
          return null;
        },
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/converters/word-to-markdown",
            element: <ConvertWordPage />,
          },
          {
            path: "/converters/pdf-to-markdown",
            element: <ConvertPDFPage />,
          },
          {
            path: "/ai-tools",
            element: <ToolsPage />,
          },
          {
            path: "/guides",
            element: <GuidesPage />,
          },
          {
            path: "/blog",
            element: <BlogPage />,
          },
          {
            path: "/faq",
            element: <FAQPage />,
          },
          {
            path: "/about",
            element: <AboutPage />,
          },
          {
            path: "/contact",
            element: <ContactPage />,
          },
          {
            path: "/privacy",
            element: <PrivacyPage />,
          },
          {
            path: "/terms",
            element: <TermsPage />,
          },
          {
            path: "/analytics",
            element: <AnalyticsPage />,
          },
          // Generate routes dynamically from toolsRegistry for any tools that have their own dedicated UI
          ...toolsRegistry.getAll().map((tool) => ({
            path: tool.route,
            element: tool.category === "conversion" && tool.id !== "pdf-to-markdown" && tool.id !== "word-to-markdown"
              ? <HomePage />
              : tool.panel ? <HomePage /> : <ToolsPage />
          })),
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          {
            path: ADMIN_LOGIN_PATH,
            element: <AdminLoginPage />,
          },
          {
            path: "/admin-dashboard",
            element: <AdminDashboardPage />,
          },
        ],
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});
