import cron from "node-cron";
import { Appointment,DoctorAvailability } from "./../../models/appointment.model";
import { AppointmentStatus } from "enums";
import { IDoctorAvailability } from "types";

cron.schedule("0 * * * *", async function () {
  const now = new Date();

  const appointments = await Appointment.find({
    status: AppointmentStatus.PENDING,
  }).populate("doctorAvailabilityId");

  for (const appointment of appointments) {
    const availability =
      appointment.doctorAvailabilityId as any as IDoctorAvailability;
    const availabilityEndTime = new Date(
      availability.startTime.getTime() +
        availability.sessionDuration * availability.numberOfAppointments * 60000
    );
    const cancelTime = new Date(
      availabilityEndTime.getTime() + 3 * 60 * 60 * 1000
    ); // 3 hours after the session end time

    if (now > cancelTime) {
      appointment.status = AppointmentStatus.CANCELLED;
      await appointment.save();

      // Update the doctor's availability status to DONE
      availability.status = AppointmentStatus.DONE;
      await DoctorAvailability.findByIdAndUpdate(
        availability._id,
        availability
      );
    }
  }
});