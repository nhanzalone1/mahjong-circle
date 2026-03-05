import { ChevronLeft, Users, Copy } from "lucide-react";
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
          className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif text-xl font-bold text-[#0D1F17]">Circles</h1>
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
        <div className="flex items-center justify-between mb-4">
          <p className="section-title">Your Circles</p>
          <span className="text-sm text-gray-500">{groupsWithCounts.length}</span>
        </div>

        {groupsWithCounts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-gray-500 mb-2">No circles yet</p>
            <p className="text-sm text-gray-400">
              Create a circle or join one with an invite code
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupsWithCounts.map((group) => (
              <div
                key={group.id}
                className="card p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1a3d2b]/10 flex items-center justify-center">
                  <Users size={20} className="text-[#1a3d2b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0D1F17] truncate">
                      {group.name}
                    </p>
                    {group.role === "admin" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/15 text-[#a08339] font-semibold">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Code</p>
                  <p className="font-mono text-sm text-[#C9A84C]">{group.inviteCode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
