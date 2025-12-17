import { Router } from "express";
import DashboardController from "../controllers/DashboardController";

const router = Router();

router.get("/dashboard/counts", DashboardController.getCounts);

router.get("/dashboard/status", DashboardController.status);

router.get("/dashboard/siniestros-data", DashboardController.getSiniestrosData);

router.get("/dashboard/coberturas-data", DashboardController.getCoberturaData);

router.get("/dashboard/recaudacion-data", DashboardController.getRecaudacionData);

router.get("/dashboard/cotizaciones-data", DashboardController.getCotizacionesData);

router.get("/dashboard/kpi-data", DashboardController.getKPIData);

export default router;
