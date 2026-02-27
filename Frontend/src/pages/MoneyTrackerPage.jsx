import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  PieChart,
  CreditCard,
  Landmark,
  Activity,
  Plus,
  TrendingUp,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  PiggyBank,
  Briefcase,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── Backend Mapper ─────────────────────────────────────────────────────
const mapTransactionStyle = (tx) => {
  let icon = Wallet;
  let color = "text-slate-500";
  let bg = "bg-slate-500/10";

  if (tx.type === "income") {
    icon = Briefcase;
    color = "text-emerald-500";
    bg = "bg-emerald-500/10";
  } else if (tx.type === "expense") {
    icon = Wallet;
    color = "text-rose-500";
    bg = "bg-rose-500/10";
    if (tx.category && tx.category.includes("Credit Card Bill")) {
      icon = CreditCard;
    }
  } else if (tx.type === "investment") {
    icon = TrendingUp;
    color = "text-indigo-500";
    bg = "bg-indigo-500/10";
  } else if (tx.type === "lending") {
    icon = ArrowUpRight;
    color = "text-amber-500";
    bg = "bg-amber-500/10";
  } else if (tx.type === "loan") {
    icon = Landmark;
    color = "text-purple-500";
    bg = "bg-purple-500/10";
  }

  return { ...tx, icon, color, bg };
};

// ── Formatter ──────────────────────────────────────────────────────────
const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// ── Main Component ─────────────────────────────────────────────────────
export default function MoneyTrackerPage({ darkMode }) {
  const { api, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [assets, setAssets] = useState([]);
  const [lendingRecords, setLendingRecords] = useState([]);

  // Fetch data on load
  useEffect(() => {
    if (user && api) {
      api
        .get("/money/data")
        .then((res) => {
          setCreditCards(res.data.creditCards);
          setTransactions(res.data.transactions.map(mapTransactionStyle));
          setAssets(res.data.assets);
          setLendingRecords(res.data.lendingRecords || []);
        })
        .catch(console.error);
    }
  }, [user, api]);

  // Modals state
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isAddCardModalOpen, setAddCardModalOpen] = useState(false);
  const [isEditAssetsModalOpen, setEditAssetsModalOpen] = useState(false);
  const [payBillData, setPayBillData] = useState(null);
  const [editCardData, setEditCardData] = useState(null);
  const [editTransactionData, setEditTransactionData] = useState(null);
  const [viewCardTx, setViewCardTx] = useState(null);
  const [isAddLendingModalOpen, setAddLendingModalOpen] = useState(false);
  const [editLendingData, setEditLendingData] = useState(null);
  const [returnLendingData, setReturnLendingData] = useState(null);
  const [returnAmount, setReturnAmount] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [returnNotes, setReturnNotes] = useState("");
  const [viewLendingData, setViewLendingData] = useState(null);

  // General Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const confirmDelete = () => {
    if (!deleteData) return;

    if (deleteData.type === "transaction") {
      const txId = deleteData.id;
      const txToDelete = transactions.find((tx) => tx.id === txId);

      api
        .delete(`/money/transactions/${txId}`)
        .then(() => {
          setTransactions((txs) => txs.filter((tx) => tx.id !== txId));

          if (txToDelete) {
            // Revert Credit Card Balance
            if (txToDelete.type === "expense") {
              const cardMatch = creditCards.find((c) =>
                txToDelete.category.includes(`(${c.name})`),
              );
              if (cardMatch) {
                const isBill =
                  txToDelete.category.startsWith("Credit Card Bill");
                const newUsed = isBill
                  ? cardMatch.used + txToDelete.amount
                  : Math.max(0, cardMatch.used - txToDelete.amount);
                const newTotalSpend = isBill
                  ? cardMatch.total_spend || 0
                  : Math.max(
                      0,
                      (cardMatch.total_spend || 0) - txToDelete.amount,
                    );

                api
                  .put(`/money/cards/${cardMatch.id}`, {
                    used: newUsed,
                    total_spend: newTotalSpend,
                  })
                  .then((cRes) => {
                    setCreditCards((cards) =>
                      cards.map((c) =>
                        c.id === cardMatch.id
                          ? {
                              ...c,
                              used: cRes.data.used,
                              total_spend: cRes.data.total_spend,
                            }
                          : c,
                      ),
                    );
                  })
                  .catch(console.error);
              }
            }
            // Revert Lending Balance
            else if (txToDelete.type === "lending") {
              const lendingMatch = lendingRecords.find(
                (r) => r.borrower === txToDelete.category,
              );
              if (lendingMatch) {
                const newTotalLent = Math.max(
                  0,
                  lendingMatch.total_lent - txToDelete.amount,
                );
                api
                  .put(`/money/lending/${lendingMatch.id}`, {
                    total_lent: newTotalLent,
                  })
                  .then((lRes) => {
                    setLendingRecords((prev) =>
                      prev.map((r) => (r.id === lRes.data.id ? lRes.data : r)),
                    );
                  })
                  .catch(console.error);
              }
            }
          }
        })
        .catch(console.error);
    } else if (deleteData.type === "card") {
      api
        .delete(`/money/cards/${deleteData.id}`)
        .then(() => {
          setCreditCards((cards) =>
            cards.filter((c) => c.id !== deleteData.id),
          );
        })
        .catch(console.error);
    } else if (deleteData.type === "lending") {
      api
        .delete(`/money/lending/${deleteData.id}`)
        .then(() => {
          setLendingRecords((prev) =>
            prev.filter((r) => r.id !== deleteData.id),
          );
        })
        .catch(console.error);
    }

    setIsDeleteModalOpen(false);
    setDeleteData(null);
  };

  // Month tracking state
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-01"));

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const formattedMonthYear = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Primary Form state
  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "bank_transfer",
    note: "",
  });

  // New Card Form State
  const [newCardData, setNewCardData] = useState({
    name: "",
    limit: "",
    used: "",
    totalSpend: "",
    dueDate: "",
  });

  // Pay Bill Form State
  const [billAmount, setBillAmount] = useState("");

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) return;

    const parsedAmount = parseFloat(formData.amount);

    // Compute the payment method suffix to append to the category for expenses
    let methodSuffix = "";
    if (formData.type === "expense") {
      if (formData.paymentMethod === "cash") methodSuffix = " (Cash)";
      else if (formData.paymentMethod === "bank_transfer")
        methodSuffix = " (Bank Account)";
      else {
        const cardName = creditCards.find(
          (c) => c.id === formData.paymentMethod,
        )?.name;
        if (cardName) methodSuffix = ` (${cardName})`;
      }
    }

    const newTxData = {
      type: formData.type,
      category:
        formData.type === "expense"
          ? formData.category + methodSuffix
          : formData.category,
      amount: parsedAmount,
      date: formData.date,
    };

    api
      .post("/money/transactions", newTxData)
      .then((res) => {
        const savedTx = mapTransactionStyle(res.data);
        setTransactions((prev) => [savedTx, ...prev]);

        // If expense and paid with a credit card, increase that card's used balance
        if (
          formData.type === "expense" &&
          formData.paymentMethod !== "bank_transfer" &&
          formData.paymentMethod !== "cash"
        ) {
          const matchingCard = creditCards.find(
            (c) => c.id === formData.paymentMethod,
          );
          if (matchingCard) {
            const newUsedAmount = matchingCard.used + parsedAmount;
            const newTotalSpend =
              (matchingCard.total_spend || 0) + parsedAmount;
            api
              .put(`/money/cards/${matchingCard.id}`, {
                used: newUsedAmount,
                total_spend: newTotalSpend,
              })
              .then((cRes) => {
                setCreditCards((cards) =>
                  cards.map((c) =>
                    c.id === matchingCard.id
                      ? {
                          ...c,
                          used: cRes.data.used,
                          total_spend: cRes.data.total_spend,
                        }
                      : c,
                  ),
                );
              });
          }
        }

        // If lending type, increase matching lending record's total_lent
        if (formData.type === "lending") {
          const matchingRec = lendingRecords.find(
            (r) => r.borrower === formData.category,
          );
          if (matchingRec) {
            api
              .put(`/money/lending/${matchingRec.id}`, {
                total_lent: matchingRec.total_lent + parsedAmount,
                date: formData.date,
                notes: formData.note || "Added from Transaction Log",
              })
              .then((lRes) => {
                setLendingRecords((prev) =>
                  prev.map((r) => (r.id === lRes.data.id ? lRes.data : r)),
                );
              })
              .catch(console.error);
          }
        }
      })
      .catch(console.error);

    setAddModalOpen(false);
    setFormData({
      type: "income",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "bank_transfer",
      note: "",
    });
  };

  const handleEditTransaction = (e) => {
    e.preventDefault();
    if (!editTransactionData.category || !editTransactionData.amount) return;

    const parsedAmount = parseFloat(editTransactionData.amount);

    let methodSuffix = "";
    let baseCategory = editTransactionData.category;
    if (editTransactionData.type === "expense") {
      baseCategory = baseCategory.replace(/\s\([^)]+\)$/, "");
      if (editTransactionData.paymentMethod === "cash")
        methodSuffix = " (Cash)";
      else if (editTransactionData.paymentMethod === "bank_transfer")
        methodSuffix = " (Bank Account)";
      else {
        const cardName = creditCards.find(
          (c) => c.id === editTransactionData.paymentMethod,
        )?.name;
        if (cardName) methodSuffix = ` (${cardName})`;
      }
    }

    const updateData = {
      type: editTransactionData.type,
      category:
        editTransactionData.type === "expense"
          ? baseCategory + methodSuffix
          : baseCategory,
      amount: parsedAmount,
      date: editTransactionData.date,
    };

    api
      .put(`/money/transactions/${editTransactionData.id}`, updateData)
      .then((res) => {
        const updatedTx = mapTransactionStyle(res.data);
        setTransactions((txs) =>
          txs.map((tx) => (tx.id === updatedTx.id ? updatedTx : tx)),
        );
      })
      .catch(console.error);

    setEditTransactionData(null);
  };

  const handleDeleteTransaction = (txId) => {
    setDeleteData({
      id: txId,
      type: "transaction",
      title: "Delete Transaction",
      message: "Are you sure you want to delete this transaction?",
    });
    setIsDeleteModalOpen(true);
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardData.name || !newCardData.limit) return;

    // Pick a random shiny gradient
    const gradients = [
      "from-rose-500 to-pink-500",
      "from-indigo-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-fuchsia-600 to-pink-600",
      "from-orange-500 to-yellow-500",
      "from-emerald-500 to-teal-500",
    ];
    const randomColor = gradients[Math.floor(Math.random() * gradients.length)];

    const newCardPayload = {
      name: newCardData.name,
      limit: parseFloat(newCardData.limit),
      used: newCardData.used ? parseFloat(newCardData.used) : 0,
      total_spend: newCardData.totalSpend
        ? parseFloat(newCardData.totalSpend)
        : 0,
      color: randomColor,
      due_date: newCardData.dueDate ? parseInt(newCardData.dueDate) : null,
    };

    api
      .post("/money/cards", newCardPayload)
      .then((res) => {
        setCreditCards((cards) => [...cards, res.data]);
      })
      .catch(console.error);

    setAddCardModalOpen(false);
    setNewCardData({
      name: "",
      limit: "",
      used: "",
      totalSpend: "",
      dueDate: "",
    });
  };

  const handleEditCard = (e) => {
    e.preventDefault();
    if (!editCardData.name || !editCardData.limit) return;

    const updatedPayload = {
      name: editCardData.name,
      limit: parseFloat(editCardData.limit),
      used: editCardData.used ? parseFloat(editCardData.used) : 0,
      total_spend: editCardData.total_spend
        ? parseFloat(editCardData.total_spend)
        : 0,
      due_date: editCardData.dueDate ? parseInt(editCardData.dueDate) : null,
    };

    api
      .put(`/money/cards/${editCardData.id}`, updatedPayload)
      .then((res) => {
        setCreditCards((cards) =>
          cards.map((c) => (c.id === res.data.id ? res.data : c)),
        );
      })
      .catch(console.error);

    setEditCardData(null);
  };

  const handleDeleteCard = (cardId) => {
    setDeleteData({
      id: cardId,
      type: "card",
      title: "Remove Credit Card",
      message: "Are you sure you want to remove this credit card?",
    });
    setIsDeleteModalOpen(true);
  };

  const handlePayBill = (e) => {
    e.preventDefault();
    if (!billAmount || !payBillData) return;

    const parsedAmount = parseFloat(billAmount);

    // Decrease the card's used amount through the api
    const matchCard = creditCards.find((c) => c.id === payBillData.cardId);
    if (!matchCard) return;

    const newUsed = Math.max(0, matchCard.used - parsedAmount);

    api
      .put(`/money/cards/${payBillData.cardId}`, { used: newUsed })
      .then((cRes) => {
        setCreditCards((cards) =>
          cards.map((c) => (c.id === cRes.data.id ? cRes.data : c)),
        );
      })
      .catch(console.error);

    // Log the payment on the timeline
    const billTx = {
      type: "expense",
      category: `Credit Card Bill (${payBillData.cardName})`,
      amount: parsedAmount,
      date: new Date().toISOString().split("T")[0],
    };

    api
      .post("/money/transactions", billTx)
      .then((res) => {
        const savedTx = mapTransactionStyle(res.data);
        setTransactions((txs) => [savedTx, ...txs]);
      })
      .catch(console.error);

    setPayBillData(null);
    setBillAmount("");
  };

  const handleSaveAssets = (e) => {
    e.preventDefault();
    api
      .put("/money/assets", assets)
      .then((res) => {
        setAssets(res.data);
        setEditAssetsModalOpen(false);
      })
      .catch(console.error);
  };

  // ── Lending Handlers ──────────────────────────────────────────
  const [newLendingData, setNewLendingData] = useState({
    borrower: "",
    total_lent: "",
    due_date: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleAddLending = (e) => {
    e.preventDefault();
    if (!newLendingData.borrower || !newLendingData.total_lent) return;
    api
      .post("/money/lending", {
        borrower: newLendingData.borrower,
        total_lent: parseFloat(newLendingData.total_lent),
        due_date: newLendingData.due_date || null,
        notes: newLendingData.notes || null,
        date: newLendingData.date,
      })
      .then((res) => {
        setLendingRecords((prev) => [res.data, ...prev]);
        setAddLendingModalOpen(false);
        setNewLendingData({
          borrower: "",
          total_lent: "",
          due_date: "",
          notes: "",
          date: new Date().toISOString().split("T")[0],
        });
      })
      .catch(console.error);
  };

  const handleEditLending = (e) => {
    e.preventDefault();
    if (!editLendingData) return;
    api
      .put(`/money/lending/${editLendingData.id}`, {
        borrower: editLendingData.borrower,
        total_lent: parseFloat(editLendingData.total_lent),
        due_date: editLendingData.due_date || null,
        notes: editLendingData.notes || null,
      })
      .then((res) => {
        setLendingRecords((prev) =>
          prev.map((r) => (r.id === res.data.id ? res.data : r)),
        );
        setEditLendingData(null);
      })
      .catch(console.error);
  };

  const handleDeleteLending = (recId) => {
    setDeleteData({
      id: recId,
      type: "lending",
      title: "Remove Lending Record",
      message: "Are you sure you want to remove this lending record?",
    });
    setIsDeleteModalOpen(true);
  };

  const handleRecordReturn = (e) => {
    e.preventDefault();
    if (!returnLendingData || !returnAmount) return;
    api
      .post(`/money/lending/${returnLendingData.id}/return`, {
        amount: parseFloat(returnAmount),
        date: returnDate,
        notes: returnNotes || "Repayment received",
      })
      .then((res) => {
        setLendingRecords((prev) =>
          prev.map((r) => (r.id === res.data.id ? res.data : r)),
        );
        setReturnLendingData(null);
        setReturnAmount("");
        setReturnDate(new Date().toISOString().split("T")[0]);
        setReturnNotes("");
      })
      .catch(console.error);
  };

  // Filter transactions by selected month/year
  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);
    return (
      txDate.getMonth() === currentDate.getMonth() &&
      txDate.getFullYear() === currentDate.getFullYear()
    );
  });

  // Derived stats
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalInvested = assets.reduce((sum, item) => sum + item.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Chart Data Processing
  const expenseByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, current) => {
      // Clean up payment method suffix if present for cleaner chart labels
      const cat = current.category.replace(/\s\([^)]+\)$/, "");
      const existing = acc.find((item) => item.name === cat);
      if (existing) {
        existing.value += current.amount;
      } else {
        acc.push({ name: cat, value: current.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  // Colors for donut chart
  const CHART_COLORS = [
    "#6366f1",
    "#10b981",
    "#f43f5e",
    "#f59e0b",
    "#8b5cf6",
    "#0ea5e9",
    "#ec4899",
    "#14b8a6",
  ];

  const monthlyTrendData = [
    {
      name: "Income",
      amount: totalIncome,
    },
    {
      name: "Expenses",
      amount: totalExpense,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full min-h-full pb-8">
      {/* ── Header ── */}
      <div
        className={`p-5 md:px-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm relative overflow-hidden ${darkMode ? "bg-gradient-to-r from-slate-900 via-[#13131e] to-slate-900 border-white/5" : "bg-gradient-to-r from-white via-slate-50 to-white border-slate-200"}`}
      >
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full point-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full point-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white flex-shrink-0">
            <PieChart size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className={`text-2xl md:text-3xl font-extrabold font-inter tracking-tight leading-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Financial Overview
            </h1>
            <p
              className={`text-sm font-outfit mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Track your wealth, expenses, and active credits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          {/* Month Selector */}
          <div
            className={`flex items-center p-1 rounded-xl border ${darkMode ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200"}`}
          >
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 w-36 justify-center">
              <Calendar
                size={14}
                className={darkMode ? "text-indigo-400" : "text-indigo-600"}
              />
              <span
                className={`text-xs font-bold font-inter tracking-wide ${darkMode ? "text-slate-200" : "text-slate-700"}`}
              >
                {formattedMonthYear}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center justify-center gap-2 flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Net Balance",
            amount: netBalance,
            icon: Wallet,
            color: "text-indigo-500",
            bg: "from-indigo-500/20 to-indigo-500/0",
            border: "border-indigo-500/20",
          },
          {
            label: "Monthly Income",
            amount: totalIncome,
            icon: ArrowDownRight,
            color: "text-emerald-500",
            bg: "from-emerald-500/20 to-emerald-500/0",
            border: "border-emerald-500/20",
          },
          {
            label: "Monthly Expenses",
            amount: totalExpense,
            icon: ArrowUpRight,
            color: "text-rose-500",
            bg: "from-rose-500/20 to-rose-500/0",
            border: "border-rose-500/20",
          },
          {
            label: "Total Invested",
            amount: totalInvested,
            icon: PiggyBank,
            color: "text-purple-500",
            bg: "from-purple-500/20 to-purple-500/0",
            border: "border-purple-500/20",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`relative p-5 rounded-3xl border overflow-hidden ${darkMode ? `bg-slate-900/40 ${stat.border}` : `bg-white border-slate-200 shadow-sm`}`}
          >
            {/* Soft gradient tail */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.bg} rounded-bl-full opacity-60 pointer-events-none`}
            />

            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${darkMode ? "bg-white/5" : "bg-slate-50 border border-slate-100"} ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
              <p
                className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {stat.label}
              </p>
            </div>
            <h2
              className={`text-2xl sm:text-3xl font-extrabold font-inter tracking-tight relative z-10 ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              {formatINR(stat.amount)}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Expense Breakdown Donut Chart */}
        <div
          className={`p-6 flex flex-col rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
            >
              <Activity size={20} />
            </div>
            <h3
              className={`text-lg font-extrabold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Expense Breakdown
            </h3>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                      borderColor: darkMode ? "#1e293b" : "#e2e8f0",
                      color: darkMode ? "#f8fafc" : "#0f172a",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontFamily: "Outfit, sans-serif",
                    }}
                    itemStyle={{ color: darkMode ? "#f8fafc" : "#0f172a" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "14px",
                      color: darkMode ? "#cbd5e1" : "#475569",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className={`flex flex-col items-center justify-center h-full text-center p-8 rounded-2xl border border-dashed ${darkMode ? "border-white/10 bg-slate-800/20" : "border-slate-200 bg-slate-50/50"}`}
              >
                <h4
                  className={`text-base font-bold font-inter ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  No Expenses
                </h4>
                <p
                  className={`text-sm font-outfit mt-1 max-w-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}
                >
                  You have no expenses logged for {formattedMonthYear}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div
          className={`p-6 flex flex-col rounded-3xl border ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
            >
              <TrendingUp size={20} />
            </div>
            <h3
              className={`text-lg font-extrabold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              Monthly Cashflow
            </h3>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            {totalIncome > 0 || totalExpense > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={darkMode ? "#334155" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: darkMode ? "#94a3b8" : "#64748b",
                      fontFamily: "Outfit",
                      fontWeight: 600,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₹${value.toLocaleString("en-IN")}`
                    }
                    tick={{
                      fill: darkMode ? "#94a3b8" : "#64748b",
                      fontFamily: "Outfit",
                    }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    contentStyle={{
                      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                      borderColor: darkMode ? "#1e293b" : "#e2e8f0",
                      color: darkMode ? "#f8fafc" : "#0f172a",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontFamily: "Outfit, sans-serif",
                    }}
                    cursor={{ fill: darkMode ? "#1e293b" : "#f1f5f9" }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={60}>
                    {monthlyTrendData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.name === "Income" ? "#10b981" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className={`flex flex-col items-center justify-center h-full text-center p-8 rounded-2xl border border-dashed ${darkMode ? "border-white/10 bg-slate-800/20" : "border-slate-200 bg-slate-50/50"}`}
              >
                <h4
                  className={`text-base font-bold font-inter ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                >
                  No Data Available
                </h4>
                <p
                  className={`text-sm font-outfit mt-1 max-w-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}
                >
                  Cannot show cashflow without income or expenses for{" "}
                  {formattedMonthYear}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* ── Left Column: Transactions ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div
            className={`flex-1 rounded-3xl border p-6 flex flex-col ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-lg font-extrabold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                Recent Transactions
              </h3>
              <button
                className={`text-sm font-semibold font-outfit ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${tx.bg} ${tx.color}`}
                      >
                        <tx.icon size={22} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p
                          className={`text-base font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                        >
                          {tx.category}
                        </p>
                        <p
                          className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {tx.date} •{" "}
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-base font-extrabold font-inter ${tx.type === "income" ? "text-emerald-500" : darkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatINR(tx.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                          onClick={() => {
                            // Extract payment method from existing category string if possible for clean editing
                            let defaultMethod = "bank_transfer";
                            if (tx.category.includes("(Cash)"))
                              defaultMethod = "cash";
                            else if (tx.category.includes("(Bank Account)"))
                              defaultMethod = "bank_transfer";
                            else {
                              const foundCard = creditCards.find((c) =>
                                tx.category.includes(`(${c.name})`),
                              );
                              if (foundCard) defaultMethod = foundCard.id;
                            }
                            setEditTransactionData({
                              ...tx,
                              paymentMethod: defaultMethod,
                            });
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className={`p-1.5 rounded-lg transition-colors ${darkMode ? "hover:bg-rose-500/20 text-rose-400 hover:text-rose-500" : "hover:bg-rose-100 text-rose-500 hover:text-rose-600"}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`flex flex-col items-center justify-center h-full text-center p-8 rounded-2xl border border-dashed ${darkMode ? "border-white/10 bg-slate-800/20" : "border-slate-200 bg-slate-50/50"}`}
                >
                  <div
                    className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${darkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Calendar size={24} />
                  </div>
                  <h4
                    className={`text-base font-bold font-inter ${darkMode ? "text-slate-300" : "text-slate-700"}`}
                  >
                    No transactions found
                  </h4>
                  <p
                    className={`text-sm font-outfit mt-1 max-w-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}
                  >
                    You have no recorded transactions for {formattedMonthYear}.
                    Click "Add Entry" to log one.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Portfolios & Credit ── */}
        <div className="flex flex-col gap-6">
          {/* Credit Cards & Loans */}
          <div
            className={`rounded-3xl border p-6 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
                >
                  <CreditCard size={20} />
                </div>
                <h3
                  className={`text-lg font-extrabold font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  Credit Cards
                </h3>
              </div>
              <button
                onClick={() => setAddCardModalOpen(true)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {creditCards.map((card) => {
                const percent = Math.min((card.used / card.limit) * 100, 100);
                return (
                  <div
                    key={card.id}
                    onDoubleClick={() => setViewCardTx(card)}
                    className="cursor-pointer select-none"
                    title="Double-click to see transactions"
                  >
                    <div className="flex justify-between items-end mb-2">
                      <span
                        className={`text-sm font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                      >
                        {card.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold font-outfit ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                        >
                          <span
                            className={
                              darkMode ? "text-white" : "text-slate-900"
                            }
                          >
                            {formatINR(card.used)}
                          </span>{" "}
                          / {formatINR(card.limit)}
                        </span>

                        {/* Show Total Spend on the card layout softly */}
                        <span
                          className={`text-[10px] font-outfit ml-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                        >
                          Spend: {formatINR(card.total_spend || 0)}
                        </span>

                        {card.used > 0 && (
                          <button
                            onClick={() =>
                              setPayBillData({
                                cardId: card.id,
                                cardName: card.name,
                                currentUsed: card.used,
                              })
                            }
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${darkMode ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"}`}
                          >
                            Pay
                          </button>
                        )}
                        <div className="flex items-center gap-1 ml-1 opacity-20 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setEditCardData({
                                ...card,
                                dueDate: card.due_date || "",
                              })
                            }
                            className={`p-1 rounded transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className={`p-1 rounded transition-colors ${darkMode ? "hover:bg-rose-500/20 text-rose-400 hover:text-rose-500" : "hover:bg-rose-100 text-rose-500 hover:text-rose-600"}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`h-2.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {card.due_date && (
                      <p
                        className={`text-[11px] font-semibold font-outfit mt-1.5 flex items-center gap-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      >
                        <span>📅</span>
                        Due: {card.due_date}
                        {card.due_date === 1 ||
                        card.due_date === 21 ||
                        card.due_date === 31
                          ? "st"
                          : card.due_date === 2 || card.due_date === 22
                            ? "nd"
                            : card.due_date === 3 || card.due_date === 23
                              ? "rd"
                              : "th"}{" "}
                        of every month
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Lending Tracker ── */}
          <div
            className={`rounded-3xl border p-6 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-lg font-extrabold font-inter tracking-tight flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                <Wallet size={20} className="text-amber-500" />
                Lending Tracker
              </h3>
              <button
                onClick={() => setAddLendingModalOpen(true)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"}`}
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {lendingRecords.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed ${darkMode ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"}`}
                >
                  <Wallet size={24} className="mb-2 opacity-40" />
                  <p className="text-sm font-semibold font-outfit">
                    No lending records yet.
                  </p>
                  <p className="text-xs mt-0.5 font-outfit opacity-70">
                    Click + to add someone you lent money to.
                  </p>
                </div>
              ) : (
                lendingRecords.map((rec) => {
                  const returnedPct = Math.min(
                    (rec.returned / rec.total_lent) * 100,
                    100,
                  );
                  const isSettled = rec.outstanding <= 0;
                  return (
                    <div
                      key={rec.id}
                      onDoubleClick={() => setViewLendingData(rec)}
                      className="cursor-pointer select-none"
                      title="Double-click to view details"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <p
                            className={`text-sm font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                          >
                            {rec.borrower}
                          </p>
                          {rec.due_date && (
                            <p
                              className={`text-[10px] font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                            >
                              Due: {rec.due_date}
                            </p>
                          )}
                          {rec.notes && (
                            <p
                              className={`text-[10px] font-outfit italic ${darkMode ? "text-slate-600" : "text-slate-400"}`}
                            >
                              {rec.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p
                              className={`text-xs font-semibold font-outfit ${isSettled ? "text-emerald-500" : darkMode ? "text-amber-400" : "text-amber-600"}`}
                            >
                              {isSettled
                                ? "✓ Settled"
                                : `₹${rec.outstanding.toLocaleString("en-IN")} left`}
                            </p>
                            <p
                              className={`text-[10px] font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                            >
                              {formatINR(rec.returned)} /{" "}
                              {formatINR(rec.total_lent)} returned
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-30 hover:opacity-100 transition-opacity">
                            {!isSettled && (
                              <button
                                onClick={() => {
                                  setReturnLendingData(rec);
                                  setReturnAmount("");
                                }}
                                className={`p-1 rounded text-[10px] font-bold transition-colors ${darkMode ? "hover:bg-emerald-500/20 text-emerald-400" : "hover:bg-emerald-100 text-emerald-600"}`}
                                title="Record Return"
                              >
                                <ArrowDownLeft size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => setEditLendingData({ ...rec })}
                              className={`p-1 rounded transition-colors ${darkMode ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500"}`}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteLending(rec.id)}
                              className={`p-1 rounded transition-colors ${darkMode ? "hover:bg-rose-500/20 text-rose-400" : "hover:bg-rose-100 text-rose-500"}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isSettled ? "bg-emerald-500" : "bg-gradient-to-r from-amber-400 to-orange-500"}`}
                          style={{ width: `${returnedPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Asset Allocation */}
          <div
            className={`rounded-3xl border p-6 ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-lg font-extrabold font-inter tracking-tight flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}
              >
                <PieChart size={20} className="text-indigo-500" />
                Asset Allocation
              </h3>
              <button
                onClick={() => setEditAssetsModalOpen(true)}
                className={`text-sm font-semibold font-outfit px-3 py-1 rounded-xl transition-all ${darkMode ? "hover:bg-white/10 text-indigo-400" : "hover:bg-indigo-50 text-indigo-600"}`}
              >
                Edit
              </button>
            </div>

            {/* Total */}
            <div className="mb-8">
              <p
                className={`text-sm font-semibold font-outfit mb-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Total Portfolio Value
              </p>
              <p
                className={`text-3xl font-black font-inter tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                {formatINR(assets.reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>

            {/* List */}
            <div className="space-y-3">
              {assets.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}
                    />
                    <span
                      className={`text-sm font-semibold font-inter ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold font-inter ${darkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {formatINR(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lending Detail Modal (double-click) ── */}
      {viewLendingData &&
        (() => {
          const rec = viewLendingData;
          const isSettled = rec.outstanding <= 0;
          const returnedPct = Math.min(
            (rec.returned / rec.total_lent) * 100,
            100,
          );
          // Show the record-specific history instead of generic global filter
          const lendingHistory = rec.history || [];
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setViewLendingData(null)}
              />
              <div
                className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
              >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <button
                    onClick={() => setViewLendingData(null)}
                    className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition-all"
                  >
                    &times;
                  </button>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet size={14} className="text-white/70" />
                      <span className="text-white/70 text-[10px] font-bold font-outfit uppercase tracking-widest">
                        Lending Record
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold font-inter text-white mb-1">
                      {rec.borrower}
                    </h2>
                    {rec.notes && (
                      <p className="text-white/70 text-xs font-outfit italic mb-3">
                        {rec.notes}
                      </p>
                    )}
                    <div className="flex gap-6 mt-3">
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Total Lent
                        </p>
                        <p className="text-white text-lg font-black font-inter">
                          {formatINR(rec.total_lent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Returned
                        </p>
                        <p className="text-white text-lg font-black font-inter">
                          {formatINR(rec.returned)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Outstanding
                        </p>
                        <p
                          className={`text-lg font-black font-inter ${isSettled ? "text-emerald-300" : "text-white"}`}
                        >
                          {isSettled ? "Settled ✓" : formatINR(rec.outstanding)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-700"
                          style={{ width: `${returnedPct}%` }}
                        />
                      </div>
                      <p className="text-white/60 text-[9px] font-outfit mt-1">
                        {Math.round(returnedPct)}% repaid
                      </p>
                    </div>
                    {rec.due_date && (
                      <p className="text-white/70 text-[10px] font-outfit mt-2">
                        📅 Due: {rec.due_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 px-5 pt-4">
                  {!isSettled && (
                    <button
                      onClick={() => {
                        setViewLendingData(null);
                        setReturnLendingData(rec);
                        setReturnAmount("");
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold font-inter text-white bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowDownLeft size={15} /> Record Return
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setViewLendingData(null);
                      setEditLendingData({ ...rec });
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold font-inter transition-all flex items-center gap-1.5 ${darkMode ? "bg-white/10 text-slate-300 hover:bg-white/15" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>

                {/* Repayment History History */}
                <div className="p-5 max-h-[300px] overflow-y-auto flex flex-col gap-1">
                  <h3
                    className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Repayment History ({lendingHistory.length})
                  </h3>
                  {lendingHistory.length > 0 ? (
                    lendingHistory.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              item.type === "lend"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            {item.type === "lend" ? (
                              <ArrowUpRight size={14} strokeWidth={2.5} />
                            ) : (
                              <ArrowDownLeft size={14} strokeWidth={2.5} />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                            >
                              {item.type === "lend"
                                ? "Lent Money"
                                : "Return Payment"}
                            </p>
                            <p
                              className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                            >
                              {item.date} {item.notes && `• ${item.notes}`}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-extrabold font-inter ${
                            item.type === "lend"
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {item.type === "lend" ? "-" : "+"}
                          {formatINR(item.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p
                        className={`text-xs font-outfit ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      >
                        No history entries found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* ── Add Lending Modal ── */}
      {isAddLendingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAddLendingModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              <Wallet size={20} className="text-amber-500" />
              Add Lending Record
            </h2>
            <form onSubmit={handleAddLending} className="flex flex-col gap-4">
              {[
                {
                  label: "Borrower Name",
                  key: "borrower",
                  type: "text",
                  placeholder: "e.g. Rahul",
                },
                {
                  label: "Amount Lent (₹)",
                  key: "total_lent",
                  type: "number",
                  placeholder: "5000",
                },
                {
                  label: "Date Lent",
                  key: "date",
                  type: "date",
                  placeholder: "",
                },
                {
                  label: "Due Date (Optional)",
                  key: "due_date",
                  type: "date",
                  placeholder: "",
                },
                {
                  label: "Notes (Optional)",
                  key: "notes",
                  type: "text",
                  placeholder: "e.g. For bike repair",
                },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={newLendingData[key]}
                    onChange={(e) =>
                      setNewLendingData({
                        ...newLendingData,
                        [key]: e.target.value,
                      })
                    }
                    required={key === "borrower" || key === "total_lent"}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-amber-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-400"}`}
                    style={
                      type === "date"
                        ? { colorScheme: darkMode ? "dark" : "light" }
                        : {}
                    }
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setAddLendingModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/25 transition-all"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Lending Modal ── */}
      {editLendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditLendingData(null)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              <Edit2 size={20} className="text-amber-500" />
              Edit Lending Record
            </h2>
            <form onSubmit={handleEditLending} className="flex flex-col gap-4">
              {[
                { label: "Borrower Name", key: "borrower", type: "text" },
                { label: "Amount Lent (₹)", key: "total_lent", type: "number" },
                { label: "Due Date", key: "due_date", type: "date" },
                { label: "Notes", key: "notes", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={editLendingData[key] ?? ""}
                    onChange={(e) =>
                      setEditLendingData({
                        ...editLendingData,
                        [key]: e.target.value,
                      })
                    }
                    required={key === "borrower" || key === "total_lent"}
                    className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-amber-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-400"}`}
                    style={
                      type === "date"
                        ? { colorScheme: darkMode ? "dark" : "light" }
                        : {}
                    }
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditLendingData(null)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Return Modal ── */}
      {returnLendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setReturnLendingData(null)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-2 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              <ArrowDownLeft size={20} className="text-emerald-500" />
              Record Return
            </h2>
            <p
              className={`text-sm font-outfit mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {returnLendingData.borrower} owes{" "}
              <span className="font-bold text-amber-500">
                {formatINR(returnLendingData.outstanding)}
              </span>
            </p>
            <form onSubmit={handleRecordReturn} className="flex flex-col gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Amount Returned (₹)
                </label>
                <input
                  type="number"
                  required
                  value={returnAmount}
                  onChange={(e) => setReturnAmount(e.target.value)}
                  max={returnLendingData.outstanding}
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-400"}`}
                  placeholder={`Max: ${returnLendingData.outstanding}`}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Return Date
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-400"}`}
                    style={{ colorScheme: darkMode ? "dark" : "light" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Paid in cash"
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-emerald-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-emerald-400"}`}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setReturnLendingData(null)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/25 transition-all"
                >
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Assets Modal ── */}
      {isEditAssetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditAssetsModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              <PieChart size={20} className="text-indigo-500" />
              Edit Asset Allocation
            </h2>

            <form onSubmit={handleSaveAssets} className="flex flex-col gap-4">
              {assets.map((asset, index) => (
                <div key={asset.id}>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {asset.label} (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={asset.amount}
                    onChange={(e) => {
                      const newAssets = [...assets];
                      newAssets[index].amount = parseFloat(e.target.value) || 0;
                      setAssets(newAssets);
                    }}
                    className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  />
                </div>
              ))}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditAssetsModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-500/25 transition-all"
                >
                  Save Assets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Transaction Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAddModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Add Transaction
            </h2>

            <form
              onSubmit={handleAddTransaction}
              className="flex flex-col gap-5"
            >
              {/* Type selector */}
              <div
                className={`flex p-1 rounded-xl w-full ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
              >
                {["income", "expense", "investment"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${formData.type === type ? (darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-800 shadow-sm") : darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div
                className={`flex p-1 rounded-xl w-full max-w-[66%] mx-auto ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}
              >
                {["lending", "loan"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${formData.type === type ? (darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-800 shadow-sm") : darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              <div className="space-y-4 mt-2">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {formData.type === "investment"
                      ? "Invest Into"
                      : formData.type === "lending"
                        ? "Lend To"
                        : "Category / Detail"}
                  </label>
                  {formData.type === "investment" ? (
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all appearance-none cursor-pointer ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                    >
                      <option value="">Select asset category...</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.label}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  ) : formData.type === "lending" &&
                    lendingRecords.length > 0 ? (
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all appearance-none cursor-pointer ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-amber-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-400"}`}
                    >
                      <option value="">Select borrower...</option>
                      {lendingRecords.map((r) => (
                        <option key={r.id} value={r.borrower}>
                          {r.borrower} — {formatINR(r.outstanding)} outstanding
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                      placeholder="e.g. Groceries, Rent..."
                    />
                  )}
                </div>

                {formData.type === "expense" && (
                  <div>
                    <label
                      className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all appearance-none cursor-pointer ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                    >
                      <option value="bank_transfer">Bank Account / UPI</option>
                      <option value="cash">Cash</option>
                      {creditCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name} (Credit)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500 hover:cursor-pointer" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400 hover:cursor-pointer"}`}
                    style={{ colorScheme: darkMode ? "dark" : "light" }}
                  />
                </div>

                {formData.type === "lending" && (
                  <div className="md:col-span-2">
                    <label
                      className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      Note (Updates Lending Tracker)
                    </label>
                    <input
                      type="text"
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-amber-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-400"}`}
                      placeholder="e.g. Added more for rent..."
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-500/25 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Add Card Modal ── */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAddCardModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              <CreditCard size={20} className="text-indigo-500" />
              Add Credit Card
            </h2>

            <form onSubmit={handleAddCard} className="flex flex-col gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Card Name
                </label>
                <input
                  type="text"
                  required
                  value={newCardData.name}
                  onChange={(e) =>
                    setNewCardData({ ...newCardData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="e.g. Amex Platinum"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Card Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newCardData.limit}
                  onChange={(e) =>
                    setNewCardData({ ...newCardData, limit: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="200000"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Currently Used (Optional ₹)
                </label>
                <input
                  type="number"
                  value={newCardData.used}
                  onChange={(e) =>
                    setNewCardData({ ...newCardData, used: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="0"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Billing Due Date — Day of Month (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newCardData.dueDate}
                  onChange={(e) =>
                    setNewCardData({ ...newCardData, dueDate: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Total Spend History (Optional ₹)
                </label>
                <input
                  type="number"
                  value={newCardData.totalSpend}
                  onChange={(e) =>
                    setNewCardData({
                      ...newCardData,
                      totalSpend: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setAddCardModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-500/25 transition-all"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Pay Bill Modal ── */}
      {payBillData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPayBillData(null)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Pay Credit Card Bill
            </h2>
            <p
              className={`text-sm font-outfit mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              How much are you paying towards your{" "}
              <strong>{payBillData.cardName}</strong>? (Current Balance:{" "}
              {formatINR(payBillData.currentUsed)})
            </p>

            <form onSubmit={handlePayBill} className="flex flex-col gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder={payBillData.currentUsed.toString()}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPayBillData(null);
                    setBillAmount("");
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-500/25 transition-all"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Edit Card Modal ── */}
      {editCardData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditCardData(null)}
          />
          <div
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <h2
              className={`text-xl font-extrabold font-inter mb-6 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              <Edit2 size={20} className="text-indigo-500" />
              Edit Credit Card
            </h2>

            <form onSubmit={handleEditCard} className="flex flex-col gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Card Name
                </label>
                <input
                  type="text"
                  required
                  value={editCardData.name}
                  onChange={(e) =>
                    setEditCardData({ ...editCardData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="e.g. Amex Platinum"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Card Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  value={editCardData.limit}
                  onChange={(e) =>
                    setEditCardData({ ...editCardData, limit: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="200000"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Currently Used (Optional ₹)
                </label>
                <input
                  type="number"
                  value={editCardData.used}
                  onChange={(e) =>
                    setEditCardData({ ...editCardData, used: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="0"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Billing Due Date — Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={editCardData.dueDate ?? ""}
                  onChange={(e) =>
                    setEditCardData({
                      ...editCardData,
                      dueDate: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Total Spend History (Optional ₹)
                </label>
                <input
                  type="number"
                  value={editCardData.total_spend ?? ""}
                  onChange={(e) =>
                    setEditCardData({
                      ...editCardData,
                      total_spend: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditCardData(null)}
                  className={`flex-1 py-3 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-md shadow-indigo-500/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Card Tx Detail Modal (double-click) ── */}
      {viewCardTx &&
        (() => {
          const cardTxs = transactions.filter((tx) =>
            tx.category.includes(`(${viewCardTx.name})`),
          );
          const totalSpent = cardTxs.reduce((sum, tx) => sum + tx.amount, 0);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setViewCardTx(null)}
              />
              <div
                className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
              >
                {/* Gradient Card Header */}
                <div
                  className={`p-6 bg-gradient-to-r ${viewCardTx.color} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <button
                    onClick={() => setViewCardTx(null)}
                    className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-lg flex items-center justify-center transition-all"
                  >
                    &times;
                  </button>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={14} className="text-white/70" />
                      <span className="text-white/70 text-[10px] font-bold font-outfit uppercase tracking-widest">
                        Credit Card
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold font-inter text-white mb-4">
                      {viewCardTx.name}
                    </h2>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Mo. Spend
                        </p>
                        <p className="text-white text-lg font-black font-inter">
                          {formatINR(totalSpent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Total Spend
                        </p>
                        <p className="text-white text-lg font-black font-inter">
                          {formatINR(viewCardTx.total_spend || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Balance Due
                        </p>
                        <p className="text-white text-lg font-black font-inter">
                          {formatINR(viewCardTx.used)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-[10px] font-outfit uppercase">
                          Limit
                        </p>
                        <p className="text-white text-lg font-black font-inter">
                          {formatINR(viewCardTx.limit)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction List */}
                <div className="p-5 max-h-80 overflow-y-auto flex flex-col gap-1">
                  <h3
                    className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Transactions on this card ({cardTxs.length})
                  </h3>
                  {cardTxs.length > 0 ? (
                    cardTxs.map((tx) => (
                      <div
                        key={tx.id}
                        className={`flex items-center justify-between p-3 rounded-2xl ${darkMode ? "bg-white/5" : "bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.bg} ${tx.color}`}
                          >
                            <tx.icon size={16} strokeWidth={2.5} />
                          </div>
                          <div>
                            <p
                              className={`text-sm font-bold font-inter ${darkMode ? "text-slate-200" : "text-slate-800"}`}
                            >
                              {tx.category.replace(` (${viewCardTx.name})`, "")}
                            </p>
                            <p
                              className={`text-xs font-outfit mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                            >
                              {tx.date}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-extrabold font-inter ${tx.category.startsWith("Credit Card Bill") ? "text-emerald-500" : "text-rose-500"}`}
                        >
                          {tx.category.startsWith("Credit Card Bill")
                            ? "+"
                            : "-"}
                          {formatINR(tx.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed ${darkMode ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-400"}`}
                    >
                      <CreditCard size={28} className="mb-3 opacity-40" />
                      <p className="text-sm font-semibold font-outfit">
                        No transactions on this card yet.
                      </p>
                      <p className="text-xs mt-1 font-outfit opacity-70">
                        Add an expense and select this card as the payment
                        method.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      {/* ── Edit Transaction Modal ── */}
      {editTransactionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditTransactionData(null)}
          />
          <div
            className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden ${darkMode ? "bg-[#181824] border border-white/10" : "bg-white"}`}
          >
            <div
              className={`p-6 border-b ${darkMode ? "border-white/10" : "border-slate-100"}`}
            >
              <h2
                className={`text-xl font-extrabold font-inter flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                <Edit2 size={20} className="text-indigo-500" />
                Edit Transaction
              </h2>
            </div>

            <form
              onSubmit={handleEditTransaction}
              className="p-6 flex flex-col gap-6"
            >
              <div
                className={`flex p-1 rounded-xl ${darkMode ? "bg-slate-900 border border-white/10" : "bg-slate-100"}`}
              >
                {["income", "expense", "investment", "lending", "loan"].map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setEditTransactionData({ ...editTransactionData, type })
                      }
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                        editTransactionData.type === type
                          ? type === "income"
                            ? "bg-emerald-500 text-white shadow-md"
                            : type === "expense"
                              ? "bg-rose-500 text-white shadow-md"
                              : type === "investment"
                                ? "bg-indigo-500 text-white shadow-md"
                                : type === "lending"
                                  ? "bg-amber-500 text-white shadow-md"
                                  : "bg-purple-500 text-white shadow-md"
                          : darkMode
                            ? "text-slate-400 hover:text-slate-300"
                            : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {type}
                    </button>
                  ),
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={editTransactionData.amount}
                    onChange={(e) =>
                      setEditTransactionData({
                        ...editTransactionData,
                        amount: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl outline-none font-inter font-semibold transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editTransactionData.date}
                    onChange={(e) =>
                      setEditTransactionData({
                        ...editTransactionData,
                        date: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500 [color-scheme:dark]" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400 [color-scheme:light]"}`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Category / Detail
                </label>
                <input
                  type="text"
                  required
                  value={editTransactionData.category}
                  onChange={(e) =>
                    setEditTransactionData({
                      ...editTransactionData,
                      category: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                />
              </div>

              {editTransactionData.type === "expense" && (
                <div>
                  <label
                    className={`block text-xs font-bold mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Payment Method
                  </label>
                  <select
                    value={editTransactionData.paymentMethod || "bank_transfer"}
                    onChange={(e) =>
                      setEditTransactionData({
                        ...editTransactionData,
                        paymentMethod: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-xl outline-none font-outfit transition-all appearance-none cursor-pointer ${darkMode ? "bg-slate-900/50 border border-white/10 text-white focus:border-indigo-500" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-400"}`}
                  >
                    <option value="bank_transfer">Bank Account / UPI</option>
                    <option value="cash">Cash</option>
                    {creditCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} (Credit)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setEditTransactionData(null)}
                  className={`flex-1 py-3.5 rounded-xl font-bold font-inter transition-all ${darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold font-inter text-white bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && deleteData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 ${darkMode ? "bg-[#161b22] border border-white/10" : "bg-white"}`}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${darkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"}`}
              >
                <Trash2 size={24} />
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                {deleteData.title}
              </h3>
              <p
                className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                {deleteData.message}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    darkMode
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
