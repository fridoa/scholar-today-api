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

async function fetchWithHeaders(path: string) {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`JSONPlaceholder error: ${response.status}`);
  }

  const data = await response.json();
  const totalCount = parseInt(response.headers.get("x-total-count") || "0", 10);
  return { data, totalCount };
}

// Posts
const getAllPosts = (queryString?: string) =>
  queryString
    ? fetchWithHeaders(`/posts?${queryString}`)
    : fetchFromJsonPlaceholder("/posts");
const getPostById = (id: string) => fetchFromJsonPlaceholder(`/posts/${id}`);
const getPostsByUserId = (userId: string) => fetchFromJsonPlaceholder(`/users/${userId}/posts`);

// Comments
const getCommentsByPostId = (postId: string) => fetchFromJsonPlaceholder(`/posts/${postId}/comments`);

// Users
const getAllUsers = () => fetchFromJsonPlaceholder("/users");
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
  getAllUsers,
  getUserById,
  getUserByEmail,
  getAlbumsByUserId,
  getPhotosByAlbumId,
  getTodosByUserId,
};
