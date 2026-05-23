import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  Eye,
  Clock,
  Loader2,
  Send,
  ArrowLeft,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES = ["All", "Questions", "Insights", "Success Stories", "General"];

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [category, setCategory] = useState("All");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [comment, setComment] = useState("");

  const { data: postsData, isLoading } = trpc.forum.listPosts.useQuery({
    page: 1,
    limit: 20,
    category: category === "All" ? undefined : category,
  });

  const { data: selectedPost } = trpc.forum.getPost.useQuery(
    { id: selectedPostId! },
    { enabled: !!selectedPostId },
  );

  const createPost = trpc.forum.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setView("list");
      setNewTitle("");
      setNewContent("");
    },
    onError: () => toast.error("Please log in to post"),
  });

  const createComment = trpc.forum.createComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
      setComment("");
    },
    onError: () => toast.error("Please log in to comment"),
  });

  const likePost = trpc.forum.likePost.useMutation();

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    createPost.mutate({
      title: newTitle,
      content: newContent,
      category: newCategory,
    });
  };

  const handleAddComment = () => {
    if (!comment.trim() || !selectedPostId) return;
    createComment.mutate({ postId: selectedPostId, content: comment });
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {view === "create"
                ? "New Post"
                : view === "detail"
                ? "Post Detail"
                : "Decision Community"}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {view === "list" && "Share insights, ask questions, learn from others"}
            </p>
          </div>
          {view === "list" ? (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error("Please log in to create a post");
                  return;
                }
                setView("create");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          ) : (
            <button
              onClick={() => setView(view === "create" ? "list" : "list")}
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        {/* List View */}
        {view === "list" && (
          <>
            {/* Categories */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-thin pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    category === c
                      ? "bg-[#00e5c0]/20 text-[#00e5c0] border border-[#00e5c0]/30"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Posts */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#00e5c0]" />
              </div>
            ) : postsData?.posts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No posts yet</p>
                <p className="text-sm text-gray-500 mt-1">Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {postsData?.posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setView("detail");
                      }}
                      className="glass-card p-5 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {post.authorName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium group-hover:text-[#00e5c0] transition-colors truncate">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-[10px] text-gray-600">
                              {post.authorName || "Anonymous"}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 capitalize">
                              {post.category}
                            </span>
                            <div className="flex items-center gap-3 text-[10px] text-gray-600">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" /> {post.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> {(post as any).commentCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {post.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Create View */}
        {view === "create" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#00e5c0]/50 transition-all"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c} className="bg-[#0a0f1a]">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share your thoughts, question, or insight..."
                rows={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all resize-none"
              />
            </div>
            <button
              onClick={handleCreatePost}
              disabled={createPost.isPending || !newTitle.trim() || !newContent.trim()}
              className="w-full py-3 bg-gradient-to-r from-[#00e5c0] to-[#33ebcd] text-[#02040a] font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,229,192,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPost.isPending ? "Posting..." : "Publish Post"}
            </button>
          </motion.div>
        )}

        {/* Detail View */}
        {view === "detail" && selectedPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Post */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center text-sm font-bold text-white">
                  {selectedPost.authorName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {selectedPost.authorName || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                    <span className="px-2 py-0.5 rounded-full bg-white/5 capitalize">
                      {selectedPost.category}
                    </span>
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-3">{selectedPost.title}</h2>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedPost.content}
              </p>
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
                <button
                  onClick={() => likePost.mutate({ postId: selectedPost.id })}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#00e5c0] transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" /> {selectedPost.likes}
                </button>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="w-4 h-4" /> {selectedPost.views}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">
                Comments ({selectedPost.comments?.length || 0})
              </h3>
              <div className="space-y-4 mb-6">
                {selectedPost.comments?.map((c) => (
                  <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        {c.authorName || "Anonymous"} &middot;{" "}
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-300">{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No comments yet. Be the first to respond!
                  </p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment();
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00e5c0]/50 transition-all"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || createComment.isPending}
                  className="p-2.5 bg-[#00e5c0]/10 text-[#00e5c0] rounded-lg hover:bg-[#00e5c0]/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
