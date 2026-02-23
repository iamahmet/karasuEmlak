export { getResendClient, sendEmail } from "./client";
export {
  EmailTemplate,
  NewListingEmailTemplate,
  PriceChangeEmailTemplate,
  SavedSearchMatchEmailTemplate,
} from "./templates";
export {
  sendNewListingNotification,
  sendPriceChangeNotification,
  sendPriceAlertNotification,
  sendSavedSearchMatchNotification,
} from "./notifications.server";

