import { ChevronLeft, Users, Plus, Copy, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyGroups, getGroupMemberCount } from "./actions";
import CreateGroupForm from "./create-group-form";
import JoinGroupForm from "./join-group-form";

export default async function GroupsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  const myGroups = await getMyGroups(user.id);

  // Get member counts for each group
  const groupsWithCounts = await Promise.all(
    myGroups.map(async (group) => ({
      ...group,
      memberCount: await getGroupMemberCount(group.id),
    }))
  );

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/70 hover:text-cream transition shadow-card"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-cream">Circles</h1>
        <div className="w-11" />
      </div>

      {/* Create Group */}
      <section>
        <p className="section-title mb-3">Create a Circle</p>
        <CreateGroupForm />
      </section>

      {/* Join Group */}
      <section>
        <p className="section-title mb-3">Join a Circle</p>
        <JoinGroupForm />
      </section>

      {/* My Groups */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Your Circles</p>
          <span className="text-sm text-cream-muted">{groupsWithCounts.length}</span>
        </div>

        {groupsWithCounts.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-cream/40" />
            </div>
            <p className="text-cream/60 mb-2">No circles yet</p>
            <p className="text-sm text-cream-muted">
              Create a circle or join one with an invite code
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupsWithCounts.map((group) => (
              <div
                key={group.id}
                className="card p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                  <span className="text-2xl">🀄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cream truncate">
                      {group.name}
                    </p>
                    {group.role === "admin" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-semibold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cream-muted">
                    {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cream-muted mb-1">Invite Code</p>
                  <p className="font-mono text-sm text-gold">{group.inviteCode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
