import axios from "axios";
import type { ReactElement } from "react";
import ReactDOMServer from "react-dom/server";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html: ReactElement;
};

export const sendEmail = async (args: SendEmailArgs) => {
  try {
    const htmlString = ReactDOMServer.renderToStaticMarkup(args.html);

    const payload = {
      to: args.to,
      subject: args.subject,
      text: args.text,
      html: htmlString,
    };

    const response = await axios.post(
      "https://ecqfn7o5a6.execute-api.us-east-1.amazonaws.com/default/bookstore-dbchanges",
      payload,
      {
        method: "POST",
      },
    );

    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};
