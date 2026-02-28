import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  CreditCard,
  TrendingUp,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Wallet,
  DollarSign,
  BarChart3,
  PiggyBank,
  Banknote,
} from "lucide-react";

// ── Formatter ──────────────────────────────────────────────────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  prefix = "",
  darkMode,
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between gap-3 border transition-all duration-200 hover:scale-[1.02] cursor-default
        ${
          darkMode
            ? "bg-slate-900 border-white/8 shadow-lg shadow-black/30"
            : "bg-white border-slate-200 shadow-sm shadow-slate-200/60"
        }`}
    >
      {/* Gradient glow blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${gradient}`}
      />

      <div className="flex items-center justify-between relative z-10">
        <span
          className={`text-xs font-bold uppercase tracking-widest font-inter ${darkMode ? "text-slate-400" : "text-slate-500"}`}
        >
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${gradient} bg-opacity-20`}
        >
          <Icon size={15} className="text-white" />
        </div>
      </div>

      <div className="relative z-10">
        <div
          className={`text-2xl font-black font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
        >
          {prefix}
          {formatINR(value)}
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ darkMode, label }) {
  return (
    <tr>
      <td colSpan="100%" className="py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}
          >
            <Search size={22} />
          </div>
          <p
            className={`text-sm font-bold font-inter ${darkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            No {label} found
          </p>
          <p
            className={`text-xs font-outfit ${darkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            Try a different month or search term
          </p>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TrackReportPage({ darkMode }) {
  const { api, user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [assets, setAssets] = useState([]);
  const [lendingRecords, setLendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("income");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user && api) {
      setLoading(true);
      api
        .get("/money/data")
        .then((res) => {
          setCreditCards(res.data.creditCards || []);
          setTransactions(res.data.transactions || []);
          setAssets(res.data.assets || []);
          setLendingRecords(res.data.lendingRecords || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, api]);

  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const formattedMonthYear = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // ── Date helpers ──────────────────────────────────────────────────────────
  const localNow = new Date();
  const yyyyNow = localNow.getFullYear();
  const mmNow = String(localNow.getMonth() + 1).padStart(2, "0");
  const ddNow = String(localNow.getDate()).padStart(2, "0");
  const realTodayStr = `${yyyyNow}-${mmNow}-${ddNow}`;

  const parseStr = (str) => ({
    year: parseInt(str?.split("-")[0], 10),
    month: parseInt(str?.split("-")[1], 10) - 1,
  });

  const isToday = (dateStr) => dateStr === realTodayStr;
  const isMonth = (dateStr) => {
    const { year, month } = parseStr(dateStr);
    return (
      year === currentDate.getFullYear() && month === currentDate.getMonth()
    );
  };
  const isYear = (dateStr) => {
    const { year } = parseStr(dateStr);
    return year === currentDate.getFullYear();
  };
  const isDisplay = (dateStr) => {
    const { year, month } = parseStr(dateStr);
    return (
      year === currentDate.getFullYear() && month === currentDate.getMonth()
    );
  };

  // ── Aggregations ──────────────────────────────────────────────────────────
  let incomeDay = 0,
    incomeMonth = 0,
    incomeYear = 0;
  let expenseDay = 0,
    expenseMonth = 0,
    expenseYear = 0;
  let ccDaySpend = 0,
    ccMonthSpend = 0,
    ccYearSpend = 0;
  let lendDay = 0,
    lendMonth = 0,
    lendYear = 0;

  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    if (t.type === "income") {
      if (isToday(t.date)) incomeDay += amt;
      if (isMonth(t.date)) incomeMonth += amt;
      if (isYear(t.date)) incomeYear += amt;
    } else if (t.type === "expense") {
      if (isToday(t.date)) expenseDay += amt;
      if (isMonth(t.date)) expenseMonth += amt;
      if (isYear(t.date)) expenseYear += amt;
      const isCC = creditCards.some((c) => t.category?.includes(c.name));
      if (isCC) {
        if (isToday(t.date)) ccDaySpend += amt;
        if (isMonth(t.date)) ccMonthSpend += amt;
        if (isYear(t.date)) ccYearSpend += amt;
      }
    }
  });

  lendingRecords.forEach((r) => {
    if (!r.history || !Array.isArray(r.history)) return;
    r.history.forEach((h) => {
      if (!h.date || h.amount == null || h.type?.toLowerCase() !== "lend")
        return;
      const amt = Number(h.amount) || 0;
      if (isToday(h.date)) lendDay += amt;
      if (isMonth(h.date)) lendMonth += amt;
      if (isYear(h.date)) lendYear += amt;
    });
  });

  const totalLendingOutstanding = lendingRecords.reduce(
    (sum, r) => sum + ((Number(r.total_lent) || 0) - (Number(r.returned) || 0)),
    0,
  );
  const totalOutstanding = creditCards.reduce(
    (sum, c) => sum + (Number(c.used) || 0),
    0,
  );
  const totalCreditLimit = creditCards.reduce(
    (sum, c) => sum + (Number(c.limit) || 0),
    0,
  );
  const totalAssets = assets.reduce(
    (sum, a) => sum + (Number(a.amount) || 0),
    0,
  );

  // ── Filtered Data ─────────────────────────────────────────────────────────
  const safe = searchTerm.toLowerCase();
  const filteredTx = transactions.filter((t) => isDisplay(t.date));
  const incomeData = filteredTx.filter(
    (t) => t.type === "income" && t.category?.toLowerCase().includes(safe),
  );
  const expenseData = filteredTx.filter(
    (t) => t.type === "expense" && t.category?.toLowerCase().includes(safe),
  );
  const lendingData = lendingRecords.filter((r) =>
    r.borrower?.toLowerCase().includes(safe),
  );
  const investData = assets.filter((a) =>
    a.label?.toLowerCase().includes(safe),
  );
  const ccData = creditCards.filter((c) =>
    c.name?.toLowerCase().includes(safe),
  );

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    {
      id: "income",
      label: "Income",
      icon: ArrowDownRight,
      accent: "from-emerald-500 to-teal-500",
      pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    },
    {
      id: "expense",
      label: "Expense",
      icon: ArrowUpRight,
      accent: "from-rose-500 to-pink-500",
      pill: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    },
    {
      id: "lending",
      label: "Lending",
      icon: Landmark,
      accent: "from-amber-500 to-orange-500",
      pill: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    },
    {
      id: "investment",
      label: "Investments",
      icon: TrendingUp,
      accent: "from-indigo-500 to-violet-500",
      pill: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    },
    {
      id: "creditcard",
      label: "Credit Cards",
      icon: CreditCard,
      accent: "from-purple-500 to-fuchsia-500",
      pill: "bg-purple-500/15 text-purple-400 border-purple-500/20",
    },
  ];

  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  const getTabTotal = () => {
    if (activeTab === "income")
      return filteredTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    if (activeTab === "expense")
      return filteredTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    if (activeTab === "lending") return totalLendingOutstanding;
    if (activeTab === "investment") return totalAssets;
    if (activeTab === "creditcard") return totalOutstanding;
    return 0;
  };

  // ── Stat card configs per tab ─────────────────────────────────────────────
  const STAT_CARDS = {
    income: [
      {
        label: "Today's Income",
        value: incomeDay,
        icon: DollarSign,
        gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
      },
      {
        label: "This Month",
        value: incomeMonth,
        icon: Calendar,
        gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
      },
      {
        label: "This Year",
        value: incomeYear,
        icon: BarChart3,
        gradient: "bg-gradient-to-br from-cyan-500 to-sky-500",
      },
    ],
    expense: [
      {
        label: "Today's Expense",
        value: expenseDay,
        icon: Wallet,
        gradient: "bg-gradient-to-br from-rose-500 to-pink-500",
      },
      {
        label: "This Month",
        value: expenseMonth,
        icon: Calendar,
        gradient: "bg-gradient-to-br from-pink-500 to-fuchsia-500",
      },
      {
        label: "This Year",
        value: expenseYear,
        icon: BarChart3,
        gradient: "bg-gradient-to-br from-fuchsia-500 to-purple-500",
      },
    ],
    lending: [
      {
        label: "Lent Today",
        value: lendDay,
        icon: Banknote,
        gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
      },
      {
        label: "Lent This Month",
        value: lendMonth,
        icon: Calendar,
        gradient: "bg-gradient-to-br from-orange-500 to-red-500",
      },
      {
        label: "Lent This Year",
        value: lendYear,
        icon: BarChart3,
        gradient: "bg-gradient-to-br from-red-500 to-rose-500",
      },
      {
        label: "Total Outstanding",
        value: totalLendingOutstanding,
        icon: Landmark,
        gradient: "bg-gradient-to-br from-rose-600 to-pink-600",
      },
    ],
    creditcard: [
      {
        label: "Today's Spend",
        value: ccDaySpend,
        icon: CreditCard,
        gradient: "bg-gradient-to-br from-purple-500 to-fuchsia-500",
      },
      {
        label: "This Month",
        value: ccMonthSpend,
        icon: Calendar,
        gradient: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
      },
      {
        label: "This Year",
        value: ccYearSpend,
        icon: BarChart3,
        gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
      },
      {
        label: "Total Outstanding",
        value: totalOutstanding,
        icon: Wallet,
        gradient: "bg-gradient-to-br from-rose-500 to-red-500",
      },
      {
        label: "Total Credit Limit",
        value: totalCreditLimit,
        icon: PiggyBank,
        gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
      },
    ],
    investment: [
      {
        label: "Total Invested",
        value: totalAssets,
        icon: TrendingUp,
        gradient: "bg-gradient-to-br from-indigo-500 to-violet-500",
      },
    ],
  };

  const activeStats = STAT_CARDS[activeTab] || [];
  const gridCols =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    }[activeStats.length] ?? "grid-cols-1 sm:grid-cols-3";

  if (loading) {
    return (
      <div
        className={`flex-1 flex items-center justify-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm font-outfit">Loading report…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-h-full pb-8">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl font-black font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Financial Report
          </h1>
          <p
            className={`text-sm font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Track your money across all categories
          </p>
        </div>

        {/* Month Picker */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm font-bold font-inter
          ${darkMode ? "bg-slate-900 border-white/8 text-white" : "bg-white border-slate-200 text-slate-800 shadow-sm"}`}
        >
          <button
            onClick={handlePrevMonth}
            className={`p-1.5 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}
          >
            <ChevronLeft size={15} />
          </button>
          <div className="flex items-center gap-2 min-w-[130px] justify-center">
            <Calendar
              size={13}
              className={darkMode ? "text-indigo-400" : "text-indigo-600"}
            />
            <span>{formattedMonthYear}</span>
          </div>
          <button
            onClick={handleNextMonth}
            className={`p-1.5 rounded-xl transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"}`}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 p-1.5 rounded-2xl overflow-x-auto
        ${darkMode ? "bg-slate-900/60 border border-white/6" : "bg-white border border-slate-200 shadow-sm"}`}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold font-inter whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${
                  isActive
                    ? `bg-gradient-to-r ${tab.accent} text-white shadow-lg`
                    : darkMode
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      {activeStats.length > 0 && (
        <div className={`grid ${gridCols} gap-4`}>
          {activeStats.map((s, i) => (
            <StatCard key={i} {...s} darkMode={darkMode} />
          ))}
        </div>
      )}

      {/* ── Data Table Card ───────────────────────────────────────────────  */}
      <div
        className={`rounded-2xl border flex flex-col overflow-hidden flex-1
        ${darkMode ? "bg-slate-900 border-white/8 shadow-xl shadow-black/30" : "bg-white border-slate-200 shadow-sm"}`}
      >
        {/* Table Toolbar */}
        <div
          className={`px-5 py-4 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between
          ${darkMode ? "border-white/6" : "border-slate-100"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTabConfig?.accent}`}
            >
              {activeTabConfig && (
                <activeTabConfig.icon size={16} className="text-white" />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-extrabold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                {activeTabConfig?.label} — {formattedMonthYear}
              </p>
              <p
                className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                Total:{" "}
                <span className="font-bold text-indigo-500">
                  {formatINR(getTabTotal())}
                </span>
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            />
            <input
              type="text"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 rounded-xl text-sm font-outfit border outline-none focus:ring-2 focus:ring-indigo-500/50 transition w-full sm:w-56
                ${
                  darkMode
                    ? "bg-slate-800 border-white/8 text-white placeholder-slate-500 focus:border-indigo-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400"
                }`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {/* INCOME */}
          {activeTab === "income" && (
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-600 border-b border-white/5" : "text-slate-400 border-b border-slate-100"}`}
                >
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Source / Category</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.length > 0 ? (
                  incomeData.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b transition-colors ${darkMode ? "border-white/4 hover:bg-white/[0.025]" : "border-slate-50 hover:bg-emerald-50/50"}`}
                    >
                      <td
                        className={`px-6 py-3.5 text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {row.date}
                      </td>
                      <td
                        className={`px-6 py-3.5 text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        {row.category}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-extrabold font-inter text-emerald-500 text-right">
                        +{formatINR(row.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState darkMode={darkMode} label="Income" />
                )}
              </tbody>
            </table>
          )}

          {/* EXPENSE */}
          {activeTab === "expense" && (
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-600 border-b border-white/5" : "text-slate-400 border-b border-slate-100"}`}
                >
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.length > 0 ? (
                  expenseData.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b transition-colors ${darkMode ? "border-white/4 hover:bg-white/[0.025]" : "border-slate-50 hover:bg-rose-50/40"}`}
                    >
                      <td
                        className={`px-6 py-3.5 text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {row.date}
                      </td>
                      <td
                        className={`px-6 py-3.5 text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        {row.category}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-extrabold font-inter text-rose-500 text-right">
                        -{formatINR(row.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState darkMode={darkMode} label="Expenses" />
                )}
              </tbody>
            </table>
          )}

          {/* LENDING */}
          {activeTab === "lending" && (
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-600 border-b border-white/5" : "text-slate-400 border-b border-slate-100"}`}
                >
                  <th className="px-6 py-3 font-semibold">Borrower</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Total Lent
                  </th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Returned
                  </th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 font-semibold">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {lendingData.length > 0 ? (
                  lendingData.map((row) => {
                    const outstanding =
                      (Number(row.total_lent) || 0) -
                      (Number(row.returned) || 0);
                    return (
                      <tr
                        key={row.id}
                        className={`border-b transition-colors ${darkMode ? "border-white/4 hover:bg-white/[0.025]" : "border-slate-50 hover:bg-amber-50/40"}`}
                      >
                        <td
                          className={`px-6 py-3.5 text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                        >
                          {row.borrower}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-sm font-medium font-inter text-right ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                        >
                          {formatINR(row.total_lent)}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-semibold font-inter text-emerald-500 text-right">
                          {formatINR(row.returned)}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-sm font-extrabold font-inter text-right ${outstanding > 0 ? "text-amber-500" : "text-emerald-500"}`}
                        >
                          {formatINR(outstanding)}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-sm font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {row.due_date || "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyState darkMode={darkMode} label="Lending Records" />
                )}
              </tbody>
            </table>
          )}

          {/* INVESTMENTS */}
          {activeTab === "investment" && (
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-600 border-b border-white/5" : "text-slate-400 border-b border-slate-100"}`}
                >
                  <th className="px-6 py-3 font-semibold">Asset Name</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {investData.length > 0 ? (
                  investData.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b transition-colors ${darkMode ? "border-white/4 hover:bg-white/[0.025]" : "border-slate-50 hover:bg-indigo-50/40"}`}
                    >
                      <td
                        className={`px-6 py-3.5 text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${row.color || "bg-indigo-500"}`}
                          />
                          {row.label}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-3.5 text-sm font-outfit uppercase tracking-wide ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                      >
                        {row.type}
                      </td>
                      <td
                        className={`px-6 py-3.5 text-sm font-extrabold font-inter text-right ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}
                      >
                        {formatINR(row.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState darkMode={darkMode} label="Investments" />
                )}
              </tbody>
            </table>
          )}

          {/* CREDIT CARDS */}
          {activeTab === "creditcard" && (
            <table className="w-full text-left">
              <thead>
                <tr
                  className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-600 border-b border-white/5" : "text-slate-400 border-b border-slate-100"}`}
                >
                  <th className="px-6 py-3 font-semibold">Card Name</th>
                  <th className="px-6 py-3 font-semibold">Bill Due</th>
                  <th className="px-6 py-3 font-semibold text-right">Limit</th>
                  <th className="px-6 py-3 font-semibold text-right">Used</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody>
                {ccData.length > 0 ? (
                  ccData.map((row) => {
                    const available = Math.max(
                      0,
                      (Number(row.limit) || 0) - (Number(row.used) || 0),
                    );
                    const usagePct =
                      row.limit > 0 ? (row.used / row.limit) * 100 : 0;
                    return (
                      <tr
                        key={row.id}
                        className={`border-b transition-colors ${darkMode ? "border-white/4 hover:bg-white/[0.025]" : "border-slate-50 hover:bg-purple-50/40"}`}
                      >
                        <td
                          className={`px-6 py-3.5 text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-800"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-5 rounded-md overflow-hidden bg-gradient-to-r ${row.color || "from-indigo-500 to-purple-500"}`}
                            />
                            {row.name}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-3.5 text-sm font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                        >
                          {row.due_date ? `Day ${row.due_date}` : "—"}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-sm font-medium text-right ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                        >
                          {formatINR(row.limit)}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`text-sm font-extrabold font-inter ${usagePct > 80 ? "text-rose-500" : darkMode ? "text-purple-400" : "text-purple-600"}`}
                            >
                              {formatINR(row.used)}
                            </span>
                            <div
                              className={`w-20 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-200"}`}
                            >
                              <div
                                className={`h-full rounded-full transition-all ${usagePct > 80 ? "bg-rose-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                                style={{ width: `${Math.min(100, usagePct)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-emerald-500 text-right">
                          {formatINR(available)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <EmptyState darkMode={darkMode} label="Credit Cards" />
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* end overflow-x-auto */}
      </div>
      {/* end table card */}
    </div>
  );
}
