'use client';
import Link from 'next/link';
import Section from "@/components/section/section";

export default function Home() {
  return (
    <>
      <Section />
      <div>
        <Link href="/leaderboard">
          <button>Go to Leaderboard</button>
        </Link>
      </div>
    </>
  );
}