import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Blog } from "./pages/Blog.jsx";
import { Signup } from "./pages/Signup.jsx";
import { Login } from "./pages/Login.jsx";
import { Settings } from "./pages/Settings.jsx";
import { PostDetail } from "./pages/PostDetail.jsx";
import { BuyTokens } from "./pages/BuyTokens.jsx";
import { MyListings } from "./pages/MyListings.jsx";
import { MyBids } from "./pages/MyBids.jsx";
import Inbox from "./pages/Inbox.jsx";
import DMChat from "./pages/DMChat.jsx";

import { AuthContentProvider } from "./contexts/AuthContext.jsx";
import { SocketIOProvider } from "./contexts/SocketIOContext.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Blog />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/buy-tokens",
    element: <BuyTokens />,
  },
  {
    path: "/my-listings",
    element: <MyListings />,
  },
  {
    path: "/my-bids",
    element: <MyBids />,
  },
  {
    path: "/dm/:userId",
    element: <DMChat />,
  },
  {
    path: "/inbox",
    element: <Inbox />,
  },
  {
    path: "/posts/:id",
    element: <PostDetail />,
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContentProvider>
        <SocketIOProvider>
          <RouterProvider router={router} />
        </SocketIOProvider>
      </AuthContentProvider>
    </QueryClientProvider>
  );
}

export default App;
