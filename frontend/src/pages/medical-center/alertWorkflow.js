import { alertService } from "../../services/alertService";
import { interventionService } from "../../services/interventionService";

/**
 * Valide l'alerte si nécessaire puis affecte une ambulance à l'intervention.
 * Même logique que RegulationDashboardPage.handleValidateAndAssign.
 */
export async function validateAndAssignAmbulance(alert, intervention, ambulanceId) {
  if (alert.status === "EN_ATTENTE_VALIDATION") {
    await alertService.updateStatus(alert.id, "VALIDEE");
  }
  return interventionService.updateStatus(intervention.id, {
    newStatus: "AMBULANCE_AFFECTEE",
    ambulanceId,
  });
}
