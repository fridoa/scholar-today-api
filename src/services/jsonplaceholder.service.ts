import { env } from "../utils/env";

const BASE_URL = env.JSON_PLACEHOLDER_URL;

// Fetch from JSONPlaceholder
async function fetchFromJsonPlaceholder(path: string) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`JSONPlaceholder error: ${response.status}`);
  }

  return response.json();
}

// Posts
const getAllPosts = () => fetchFromJsonPlaceholder("/posts");
const getPostById = (id: string) => fetchFromJsonPlaceholder(`/posts/${id}`);
const getPostsByUserId = (userId: string) => fetchFromJsonPlaceholder(`/users/${userId}/posts`);

// Comments
const getCommentsByPostId = (postId: string) => fetchFromJsonPlaceholder(`/posts/${postId}/comments`);

// Users
const getUserById = (id: string) => fetchFromJsonPlaceholder(`/users/${id}`);
const getUserByEmail = async (email: string) => {
  const users = await fetchFromJsonPlaceholder(`/users?email=${encodeURIComponent(email)}`);
  return users && users.length > 0 ? users[0] : null;
};

// Albums & Photos
const getAlbumsByUserId = (userId: string) => fetchFromJsonPlaceholder(`/users/${userId}/albums`);
const getPhotosByAlbumId = (albumId: string) => fetchFromJsonPlaceholder(`/albums/${albumId}/photos`);

// Todos
const getTodosByUserId = (userId: string) => fetchFromJsonPlaceholder(`/users/${userId}/todos`);

export default {
  getAllPosts,
  getPostById,
  getPostsByUserId,
  getCommentsByPostId,
  getUserById,
  getUserByEmail,
  getAlbumsByUserId,
  getPhotosByAlbumId,
  getTodosByUserId,
};
