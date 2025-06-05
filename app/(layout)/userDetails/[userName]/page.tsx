import { fetchUserDetails } from '@/utils/github/github';
import React from 'react';



export default async function UserDetails({ params }: { params: Promise<{ userName: string }> }) {
  const { userName } = await params;
  const userDetails = await fetchUserDetails(userName);
  console.log(userDetails);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Hi, I am {userDetails.name || 'a GitHub user'}
      </h1>
      <div className="flex flex-col items-center mb-6">
        <img
          src={userDetails.avatar_url}
          alt={`${userDetails.login}'s avatar`}
          className="w-32 h-32 rounded-full border-4 border-gray-300 shadow-lg"
        />
      </div>
      <div className="space-y-4">
        <p>
          <strong className="font-semibold">Username:</strong> {userDetails.login}
        </p>
        <p>
          <strong className="font-semibold">Location:</strong> {userDetails.location || 'Not specified'}
        </p>
        <p>
          <strong className="font-semibold">Company:</strong> {userDetails.company || 'Not specified'}
        </p>
        <p>
          <strong className="font-semibold">Bio:</strong> {userDetails.bio || 'Not specified'}
        </p>
        <p>
          <strong className="font-semibold">Blog:</strong>{' '}
          <a
            href={userDetails.blog || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {userDetails.blog || 'Not specified'}
          </a>
        </p>
        <p>
          <strong className="font-semibold">Twitter:</strong>{' '}
          {userDetails.twitter_username ? (
            <a
              href={`https://twitter.com/${userDetails.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              @{userDetails.twitter_username}
            </a>
          ) : (
            'Not specified'
          )}
        </p>
        <p>
          <strong className="font-semibold">Public Profile:</strong>{' '}
          <a
            href={userDetails.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {userDetails.html_url}
          </a>
        </p>
        <p>
          <strong className="font-semibold">Following:</strong> {userDetails.following}
        </p>
        <p>
          <strong className="font-semibold">Account Created:</strong>{' '}
          {new Date(userDetails.created_at).toLocaleDateString()}
        </p>
        <p>
          <strong className="font-semibold">Last Updated:</strong>{' '}
          {new Date(userDetails.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}