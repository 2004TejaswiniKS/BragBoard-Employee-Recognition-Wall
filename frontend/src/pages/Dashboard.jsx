import { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import Feed from "./Feed";
import MyProfile from "./MyProfile";
import ShoutoutCreate from "./ShoutoutCreate";
import { FeedFilterContext } from "../context/FeedFilterContext";

export default function Dashboard() {
  const { filter } = useContext(FeedFilterContext);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshFeed = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="bb-layout">
      <Sidebar />

      <main className="bb-main">
        {filter.type === "profile" ? (
          <MyProfile />
        ) : (
          <div className="bb-two-col">
            {/* CREATE SHOUTOUT */}
            <div className="bb-card">
              <ShoutoutCreate onCreated={refreshFeed} />
            </div>

            {/* FEED */}
            <div className="bb-card bb-feed-card">
              <Feed refreshKey={refreshKey} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
