import { fmt, timeOf } from "../format.js";

export default function ActivityCard({ entries }) {
  return (
    <section className="card panel">
      <div className="activity-head">
        <h2>Activity</h2>
        <span className="count">{entries.length}</span>
      </div>
      {entries.length === 0 ? (
        <p className="none">No payments this session.</p>
      ) : (
        <ul className="activity">
          {entries.map((entry) => (
            <li key={entry.key}>
              <span className={"mini " + (entry.ok ? "ok" : "bad")}>
                {entry.ok ? "Sent" : "Refused"}
              </span>
              <div className="act-main">
                <b>{entry.vendor}</b>
                <span>{fmt(entry.amount_xlm)} XLM</span>
              </div>
              <time>{timeOf(entry.time)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
