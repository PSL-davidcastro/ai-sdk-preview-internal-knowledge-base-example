"use client";

import { motion, AnimatePresence } from "framer-motion";
import { InfoIcon, MenuIcon, PencilEditIcon, TrashIcon } from "./icons";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import cx from "classnames";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Chat } from "@/schema";
import { fetcher } from "@/utils/functions";

export const History = () => {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const {
    data: history,
    error,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>("/api/history", fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/delete?id=${chatId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mutate(); // Refresh the history list

        // If the currently viewed chat is deleted, redirect to home
        if (id === chatId) {
          router.push("/");
        }
      } else {
        console.error("Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setChatToDelete(null); // Close confirmation dialog
    }
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
  };

  const handleCancelDelete = () => {
    setChatToDelete(null);
  };

  return (
    <>
      <div
        className="dark:text-zinc-400 text-zinc-500 cursor-pointer"
        onClick={() => {
          setIsHistoryVisible(true);
        }}
      >
        <MenuIcon />
      </div>

      <AnimatePresence>
        {isHistoryVisible && (
          <>
            <motion.div
              className="fixed bg-zinc-900/50 h-dvh w-dvw top-0 left-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsHistoryVisible(false);
              }}
            />

            <motion.div
              className="fixed top-0 left-0 w-80 h-dvh p-3 flex flex-col gap-6 bg-white dark:bg-zinc-800 z-20"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <div className="text-sm flex flex-row items-center justify-between">
                <div className="flex flex-row gap-2">
                  <div className="dark:text-zinc-300">History</div>
                  <div className="dark:text-zinc-500 text-zinc-500">
                    {history === undefined ? "loading" : history.length} chats
                  </div>
                </div>

                <Link
                  href="/"
                  className="dark:text-zinc-400 dark:bg-zinc-700 hover:dark:bg-zinc-600 bg-zinc-100 hover:bg-zinc-200 p-1.5 rounded-md cursor-pointer"
                  onClick={() => {
                    setIsHistoryVisible(false);
                  }}
                >
                  <PencilEditIcon size={14} />
                </Link>
              </div>

              <div className="flex flex-col overflow-y-scroll">
                {error && error.status === 401 ? (
                  <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                    <InfoIcon />
                    <div>Login to save and revisit previous chats!</div>
                  </div>
                ) : null}

                {!isLoading && history?.length === 0 && !error ? (
                  <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                    <InfoIcon />
                    <div>No chats found</div>
                  </div>
                ) : null}

                {isLoading && !error ? (
                  <div className="flex flex-col w-full">
                    {[44, 32, 28, 52].map((item) => (
                      <div
                        key={item}
                        className="p-2 border-b dark:border-zinc-700"
                      >
                        <div
                          className={`w-${item} h-[20px] bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {history &&
                  history.map((chat) => (
                    <div
                      key={chat.id}
                      className={cx(
                        "flex items-center justify-between p-2 border-b dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 last-of-type:border-b-0 group",
                        {
                          "dark:bg-zinc-700 bg-zinc-200": id === chat.id,
                        }
                      )}
                    >
                      <Link
                        href={`/${chat.id}`}
                        className="flex-1 dark:text-zinc-400 truncate"
                        onClick={() => {
                          setIsHistoryVisible(false);
                        }}
                      >
                        {chat.messages[0].content as string}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteClick(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-all"
                        title="Delete chat"
                      >
                        <TrashIcon size={12} />
                      </button>
                    </div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {chatToDelete && (
          <>
            <motion.div
              className="fixed bg-zinc-900/50 h-dvh w-dvw top-0 left-0 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelDelete}
            />

            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg z-30 w-80"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <h3 className="text-lg font-semibold mb-4 dark:text-zinc-100">
                Delete Chat
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Are you sure you want to delete this chat? This action cannot be
                undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-md dark:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(chatToDelete)}
                  className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
