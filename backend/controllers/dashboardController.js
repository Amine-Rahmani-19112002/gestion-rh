const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Absence = require("../models/Absence");
const Pointage = require("../models/Pointage");

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // =========================================================================
    // BRANCHE COLLABORATEUR (RÔLE EMPLOYÉ) : STATISTIQUES STRICTEMENT PERSONNELLES
    // =========================================================================
    if (req.user && req.user.role === "employe") {
      const employeeId = req.user.employee;
      const userId = req.user._id;

      // 1. Pointage du jour de l'employé
      const myPointageToday = await Pointage.findOne({
        user: userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      // 2. Absence / Télétravail du jour de l'employé
      const myAbsenceToday = employeeId
        ? await Absence.findOne({
            employee: employeeId,
            date: { $gte: startOfDay, $lte: endOfDay },
          })
        : null;

      // 3. Congé actif aujourd'hui de l'employé
      const myLeaveToday = employeeId
        ? await Leave.findOne({
            employee: employeeId,
            statut: "Approuvé",
            dateDebut: { $lte: endOfDay },
            dateFin: { $gte: startOfDay },
          })
        : null;

      // 4. Congés en attente et approuvés de l'employé
      const myPendingLeaves = employeeId
        ? await Leave.countDocuments({ employee: employeeId, statut: "En attente" })
        : 0;
      const myApprovedLeaves = employeeId
        ? await Leave.countDocuments({ employee: employeeId, statut: "Approuvé" })
        : 0;

      // 5. Absences et retards du mois pour l'employé
      const myMonthAbsences = employeeId
        ? await Absence.find({
            employee: employeeId,
            date: { $gte: startOfMonth, $lt: startOfNextMonth },
          })
        : [];

      const myDelaysThisMonth = myMonthAbsences.filter((a) => a.type === "Retard").length;
      const myAbsencesThisMonth = myMonthAbsences.filter((a) => a.type === "Absence").length;
      const myTeleworkThisMonth = myMonthAbsences.filter((a) => a.type === "Télétravail").length;

      // 6. Mes derniers événements / demandes récents
      const myRecentLeaves = employeeId
        ? await Leave.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(5)
        : [];
      const myRecentAbsences = employeeId
        ? await Absence.find({ employee: employeeId }).sort({ date: -1 }).limit(5)
        : [];

      // Détermination de l'état actuel de l'employé
      let currentStatusText = "Non pointé";
      if (myLeaveToday) {
        currentStatusText = `En congé (${myLeaveToday.typeConge})`;
      } else if (myAbsenceToday) {
        currentStatusText = myAbsenceToday.type;
      } else if (myPointageToday?.clockInTime) {
        currentStatusText = myPointageToday.status || "Présent";
      }

      return res.json({
        isEmployee: true,
        cards: {
          currentStatus: currentStatusText,
          clockInTime: myPointageToday?.clockInTime || null,
          clockOutTime: myPointageToday?.clockOutTime || null,
          pendingLeaves: myPendingLeaves,
          approvedLeaves: myApprovedLeaves,
          delaysThisMonth: myDelaysThisMonth,
          absencesThisMonth: myAbsencesThisMonth,
          teleworkThisMonth: myTeleworkThisMonth,
        },
        myRecentLeaves,
        myRecentAbsences,
        myPointageToday,
      });
    }

    // =========================================================================
    // BRANCHE ADMINISTRATEUR : VUE GLOBALE RH DE L'ENTREPRISE
    // =========================================================================
    // 1. Employés
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ statut: "Actif" });
    const inactiveEmployees = await Employee.countDocuments({ statut: "Inactif" });
    const onLeaveEmployees = await Employee.countDocuments({ statut: "En congé" });

    // 2. Pointages & Présence aujourd'hui
    const todayPointages = await Pointage.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const teleworkToday = await Absence.countDocuments({
      type: "Télétravail",
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Absences aujourd'hui
    const todayAbsences = await Absence.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("employee", "matricule nom prenom poste departement telephone email");

    // Retards aujourd'hui et du mois
    const delaysToday = todayAbsences.filter((a) => a.type === "Retard");
    const delaysTodayCount = delaysToday.length;

    const monthDelays = await Absence.find({
      type: "Retard",
      date: { $gte: startOfMonth, $lt: startOfNextMonth },
    });

    const avgDelayMinutes =
      monthDelays.length > 0
        ? Math.round(
            monthDelays.reduce((acc, curr) => acc + (curr.retardMinutes || 0), 0) /
              monthDelays.length
          )
        : delaysToday.length > 0
        ? Math.round(
            delaysToday.reduce((acc, curr) => acc + (curr.retardMinutes || 0), 0) /
              delaysToday.length
          )
        : 0;

    // Congés approuvés actifs aujourd'hui
    const todayApprovedLeaves = await Leave.countDocuments({
      statut: "Approuvé",
      dateDebut: { $lte: endOfDay },
      dateFin: { $gte: startOfDay },
    });

    // Maladie aujourd'hui (Absence motif maladie ou Congé maladie)
    const illnessToday =
      todayAbsences.filter((a) => a.type === "Absence" && /malad/i.test(a.motif || "")).length +
      (await Leave.countDocuments({
        typeConge: "Congé maladie",
        statut: "Approuvé",
        dateDebut: { $lte: endOfDay },
        dateFin: { $gte: startOfDay },
      }));

    // Injustifiées aujourd'hui
    const unjustifiedTodayCount = todayAbsences.filter(
      (a) => a.type === "Absence" && !a.justifiee
    ).length;

    // Calcul de la présence effective
    const clockedInCount = todayPointages.filter((p) => p.clockInTime).length;
    const absencesCount = todayAbsences.filter((a) => a.type === "Absence").length;
    const estimatedPresent = Math.max(0, activeEmployees - (absencesCount + todayApprovedLeaves));
    
    // Si des pointages existent pour aujourd'hui, on les utilise en priorité, sinon l'estimation
    const effectivePresent = clockedInCount > 0 ? clockedInCount : estimatedPresent;
    const presenceRate =
      activeEmployees > 0
        ? Number(((effectivePresent / activeEmployees) * 100).toFixed(1))
        : 100;

    const onSiteCount = Math.max(0, effectivePresent - teleworkToday);

    // 3. Demandes de congés
    const pendingLeaves = await Leave.countDocuments({ statut: "En attente" });
    const approvedLeaves = await Leave.countDocuments({ statut: "Approuvé" });

    // 4. Par département
    const employeesByDeptAgg = await Employee.aggregate([
      {
        $group: {
          _id: "$departement",
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const monthAbsences = await Absence.find({
      date: { $gte: startOfMonth, $lt: startOfNextMonth },
    }).populate("employee", "departement");

    const deptStats = employeesByDeptAgg.map((d) => {
      const deptName = d._id || "Non défini";
      const count = d.total;
      const deptDelays = monthAbsences.filter(
        (a) => a.employee && a.employee.departement === deptName && a.type === "Retard"
      ).length;
      const deptAbs = monthAbsences.filter(
        (a) => a.employee && a.employee.departement === deptName && a.type === "Absence"
      ).length;

      const rate =
        count > 0
          ? Math.max(70, Math.min(100, Number((100 - (deptAbs / count) * 8).toFixed(1))))
          : 95;

      return {
        name: deptName,
        count: `${count} pers.`,
        rawCount: count,
        rate,
        retard: deptDelays,
      };
    });

    // 5. Absences non justifiées récentes
    const unjustifiedAbsencesList = await Absence.find({ justifiee: false })
      .populate("employee", "matricule nom prenom poste departement telephone email")
      .sort({ date: -1 })
      .limit(5);

    // 6. Derniers incidents (absences/retards récents)
    const recentIncidents = await Absence.find()
      .populate("employee", "matricule nom prenom poste departement")
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    // 7. Motifs d'absence du mois (distribution)
    const paidLeavesMonth = await Leave.countDocuments({
      typeConge: "Congé annuel",
      statut: "Approuvé",
      dateDebut: { $gte: startOfMonth, $lt: startOfNextMonth },
    });

    const sickLeavesMonth = await Leave.countDocuments({
      typeConge: "Congé maladie",
      statut: "Approuvé",
      dateDebut: { $gte: startOfMonth, $lt: startOfNextMonth },
    });

    const otherLeavesMonth = await Leave.countDocuments({
      typeConge: { $nin: ["Congé annuel", "Congé maladie"] },
      statut: "Approuvé",
      dateDebut: { $gte: startOfMonth, $lt: startOfNextMonth },
    });

    const sickAbsences = monthAbsences.filter(
      (a) => a.type === "Absence" && /malad/i.test(a.motif || "")
    ).length;

    const unjustifiedMonth = monthAbsences.filter(
      (a) => a.type === "Absence" && !a.justifiee
    ).length;

    const delaysMonth = monthDelays.length;

    const totalEvents =
      paidLeavesMonth +
      sickLeavesMonth +
      otherLeavesMonth +
      sickAbsences +
      unjustifiedMonth +
      delaysMonth;

    const safeTotal = totalEvents > 0 ? totalEvents : 1;

    const congesVal = paidLeavesMonth;
    const maladieVal = sickLeavesMonth + sickAbsences;
    const rttVal = otherLeavesMonth;
    const retardsVal = delaysMonth + unjustifiedMonth;

    const motifs = [
      {
        name: "Congés payés",
        count: congesVal,
        color: "#2563eb",
        percent: totalEvents > 0 ? Math.round((congesVal / safeTotal) * 100) : 45,
      },
      {
        name: "Maladie / AT",
        count: maladieVal,
        color: "#64748b",
        percent: totalEvents > 0 ? Math.round((maladieVal / safeTotal) * 100) : 30,
      },
      {
        name: "RTT & Récup",
        count: rttVal,
        color: "#93c5fd",
        percent: totalEvents > 0 ? Math.round((rttVal / safeTotal) * 100) : 15,
      },
      {
        name: "Retards / Non just.",
        count: retardsVal,
        color: "#e11d48",
        percent: totalEvents > 0 ? Math.round((retardsVal / safeTotal) * 100) : 10,
      },
    ];

    res.json({
      cards: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        onLeaveEmployees,
        presenceRate,
        onSiteCount,
        teleworkToday,
        delaysToday: delaysTodayCount,
        avgDelayMinutes,
        absencesToday: todayAbsences.length,
        congesToday: todayApprovedLeaves,
        maladieToday: illnessToday,
        unjustifiedToday: unjustifiedTodayCount,
        pendingLeaves,
        approvedLeaves,
        absencesThisMonth: monthAbsences.length,
        delaysThisMonth: monthDelays.length,
        unjustifiedAbsences: unjustifiedMonth,
      },
      employeesByDepartment: deptStats,
      unjustifiedAbsencesList,
      recentIncidents,
      motifsAbsence: {
        totalDays: totalEvents > 0 ? totalEvents : 0,
        items: motifs,
      },
    });
  } catch (error) {
    console.error("Erreur getDashboardStats:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };