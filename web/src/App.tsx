import { useMemo, useState } from "react";
import ActivityCard, { type ActivityEntry } from "./components/ActivityCard.js";
import BalanceCard from "./components/BalanceCard.js";
import ChatPanel from "./components/ChatPanel.js";
import Header from "./components/Header.js";
import RulesCard from "./components/RulesCard.js";
import { useBalance } from "./hooks/useBalance.js";
import { useChat } from "./hooks/useChat.js";

export default function App() {
  const balance = useBalance();
  // After every agent reply, re-read the balance so the number stays honest.
  const chat = useChat({ onSettled: balance.refresh });
  const [showMore, setShowMore] = useState(false); // phone layout only

  // The activity list is derived from the conversation: newest first.
  const activity = useMemo<ActivityEntry[]>(
    () =>
      chat.items
        .flatMap((item) =>
          item.kind === "agent"
            ? item.events.map((ev, index) => ({ ...ev, key: `${item.id}-${index}`, time: item.time }))
            : []
        )
        .reverse(),
    [chat.items]
  );

  return (
    <div className={"app" + (showMore ? " show-more" : "")}>
      <Header status={balance.status} />

      <div className="layout">
        <ChatPanel chat={chat} onOpenMore={() => setShowMore(true)} />

        <BalanceCard
          xlm={balance.xlm}
          status={balance.status}
          updatedAt={balance.updatedAt}
          delta={balance.delta}
          refreshing={balance.refreshing}
          onRefresh={balance.refresh}
        />

        <div className="more">
          <button className="btn back-btn" type="button" onClick={() => setShowMore(false)}>
            Back to chat
          </button>
          <RulesCard />
          <ActivityCard entries={activity} />
        </div>
      </div>
    </div>
  );
}
