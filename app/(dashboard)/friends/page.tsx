import { ChevronLeft, UserPlus, Copy, Check, Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, getOrCreateProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFriendsWithProfiles } from "./actions";
import AddFriendForm from "./add-friend-form";
import RemoveFriendButton from "./remove-friend-button";

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const profile = await getOrCreateProfile(user);
  const friends = await getFriendsWithProfiles(user.id);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/70 hover:text-cream transition shadow-card"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-cream">Friends</h1>
        <div className="w-11" />
      </div>

      {/* Your Invite Code */}
      <section>
        <p className="section-title mb-3">Your Invite Code</p>
        <div className="card p-5 text-center">
          <p className="font-mono text-3xl font-bold text-gold tracking-[0.3em] mb-3">
            {profile.inviteCode}
          </p>
          <p className="text-sm text-cream-muted">
            Share this code with friends so they can add you
          </p>
        </div>
      </section>

      {/* Add Friend */}
      <section>
        <p className="section-title mb-3">Add a Friend</p>
        <AddFriendForm />
      </section>

      {/* Friends List */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Your Friends</p>
          <span className="text-sm text-cream-muted">{friends.length}</span>
        </div>

        {friends.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-cream/40" />
            </div>
            <p className="text-cream/60 mb-2">No friends yet</p>
            <p className="text-sm text-cream-muted">
              Enter a friend's invite code above to connect
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => {
              const initials = friend.displayName
                .split(" ")
                .map(n => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={friend.id}
                  className="card p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-lg font-bold text-white">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-cream truncate">
                      {friend.displayName}
                    </p>
                    <p className="text-sm text-cream-muted">
                      {friend.rankTitle || "Novice"}
                    </p>
                  </div>
                  <RemoveFriendButton friendshipId={friend.friendshipId!} friendName={friend.displayName} />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
