import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const fallbackData = [
    { id: '1', media_url: '/uploads/blossom-yellow.jpg', permalink: 'https://www.instagram.com/anahbysr', like_count: 842, comments_count: 34 },
    { id: '2', media_url: '/uploads/ombre-yellow-rust.jpg', permalink: 'https://www.instagram.com/anahbysr', like_count: 1243, comments_count: 57 },
    { id: '3', media_url: '/uploads/checks-orange.jpg', permalink: 'https://www.instagram.com/anahbysr', like_count: 965, comments_count: 41 },
    { id: '4', media_url: '/uploads/blossom-ivory.jpg', permalink: 'https://www.instagram.com/anahbysr', like_count: 2104, comments_count: 89 },
    { id: '5', media_url: '/uploads/dots-sky.jpg', permalink: 'https://www.instagram.com/anahbysr', like_count: 734, comments_count: 28 },
    { id: '6', media_url: '/uploads/ombre-magenta-pink.jpg', permalink: 'https://www.instagram.com/anahbysr', like_count: 1503, comments_count: 63 },
  ];

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!token || token === 'mock_ig_token') {
    return NextResponse.json(fallbackData);
  }

  try {
    // Check DB cache first
    const cache = await prisma.instagramCache.findUnique({ where: { id: 1 } });
    
    // If cache is less than 60 mins old, return it
    if (cache && Date.now() - new Date(cache.fetchedAt).getTime() < 60 * 60 * 1000) {
      return NextResponse.json(JSON.parse(cache.posts));
    }

    // Fetch new — request engagement counts + video thumbnails where available
    const res = await fetch(`https://graph.instagram.com/me/media?fields=id,media_url,thumbnail_url,media_type,permalink,like_count,comments_count,timestamp&access_token=${token}&limit=6`);
    if (!res.ok) throw new Error('Failed to fetch from Instagram API');

    const data = await res.json();
    // For VIDEO posts media_url is an mp4; use thumbnail_url so it renders as an image.
    const posts = (data.data || []).map((p: { media_type?: string; media_url?: string; thumbnail_url?: string }) => ({
      ...p,
      media_url: p.media_type === 'VIDEO' && p.thumbnail_url ? p.thumbnail_url : p.media_url,
    }));

    // Save to cache
    if (posts.length > 0) {
      await prisma.instagramCache.upsert({
        where: { id: 1 },
        update: { posts: JSON.stringify(posts), fetchedAt: new Date() },
        create: { id: 1, posts: JSON.stringify(posts), fetchedAt: new Date() }
      });
      return NextResponse.json(posts);
    }
    
    return NextResponse.json(fallbackData);
  } catch (error) {
    console.error('Instagram API Error:', error);
    return NextResponse.json(fallbackData);
  }
}
