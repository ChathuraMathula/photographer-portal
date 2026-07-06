import * as Yup from "yup";

export const AvailabilitySchema = Yup.object({
  date: Yup.string()
    .required("Date is required")
    .test("not-past", "Date must be in the future (tomorrow or later)", function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(value);
      selected.setHours(0, 0, 0, 0);
      return selected > today;
    }),
  startTime: Yup.string()
    .required("Start time is required")
    .test("not-past-time", "Start time cannot be in the past", function (value) {
      if (!value) return false;
      const { date } = this.parent;
      if (!date) return true;
      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA");
      if (date === todayStr) {
        const currentTime = today.toTimeString().slice(0, 5); // "HH:MM"
        return value >= currentTime;
      }
      return true;
    }),
  endTime: Yup.string()
    .required("End time is required")
    .test("after-start", "End time must be after start time", function (v) {
      return !!v && v > this.parent.startTime;
    }),
  eventType: Yup.string().required("Event type is required"),
});

export const DetailsSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[+]?[0-9\s-]{7,15}$/, "Please enter a valid phone number"),
  location: Yup.string().required("Venue / Location address is required"),
  city: Yup.string().required("City is required"),
  district: Yup.string().required("District is required"),
  locationMapLink: Yup.string().url("Must be a valid URL").required("Map pin location is required"),
  coordinates: Yup.string()
    .nullable()
    .optional()
    .test(
      "valid-coords",
      "Invalid coordinates. Format: 'latitude, longitude' (e.g. 7.2905, 80.6337)",
      (val) => {
        if (!val) return true;
        const match = val.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
        if (!match) return false;
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
      }
    ),
  notes: Yup.string(),
});
