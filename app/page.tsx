import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Dashboard</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage src={session.user.image || ""} />
                                <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{session.user.name}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h3 className="text-green-800 font-semibold mb-2">System Status</h3>
                            <p className="text-green-700">✅ Database Connected (D1)</p>
                            <p className="text-green-700">✅ Auth System Ready</p>
                        </div>

                        <SignOutButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
