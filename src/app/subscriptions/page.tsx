import { getSubscriptions } from "@/actions/subscription";
import { SubscribeButton } from "@/features/video/components/SubscribeButton";
import Link from "next/link";
import Image from "next/image";

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions</h1>
        <div className="flex gap-2 text-sm text-muted-text">
            <span>{subscriptions.length} channels</span>
        </div>
      </div>
      
      {subscriptions.length === 0 ? (
          <div className="text-center py-20 bg-noir-terminal/40 rounded-xl border border-noir-border">
              <h1 className="text-2xl font-bold mb-2">You&apos;re not subscribed to anyone</h1>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-noir-terminal rounded-xl p-6 flex flex-col items-center text-center border border-transparent hover:border-noir-border transition-all">
                      <Link href={`/${sub.channelHandle}`} className="mb-4">
                          <div className="w-20 h-20 rounded-full bg-noir-bg border-2 border-noir-border relative overflow-hidden">
                              <Image 
                                  src={sub.avatarUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${sub.channelHandle}`} 
                                  alt={sub.channelName} 
                                  fill 
                                  className="object-cover"
                              />
                          </div>
                      </Link>
                      <Link href={`/${sub.channelHandle}`} className="block">
                          <h3 className="font-bold text-foreground hover:text-electric-lime transition-colors">{sub.channelName}</h3>
                          <p className="text-xs text-muted-text mb-4">@{sub.channelHandle}</p>
                      </Link>
                      <SubscribeButton 
                          channelId={sub.channelId} 
                          channelName={sub.channelName} 
                          initialIsSubscribed={true}
                      />
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}
