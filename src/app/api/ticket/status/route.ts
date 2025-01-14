import Ticket from "@models/Ticket";
import { connectToDB } from "@utils/database";

export const GET = async (): Promise<Response> => {
  try {
    await connectToDB();
    const ticket = await Ticket.findOne({ totalTicket: 100 });

    if (!ticket) {
      return new Response(JSON.stringify({ message: "Ticket not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ value: ticket.ticketSold }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
