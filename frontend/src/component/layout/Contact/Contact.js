import React from "react";
import "./Contact.css";
import { Button } from "@material-ui/core";

const Contact = () => {
  return (
<div className="contactContainer">
      <div className="contactDetails">
        <a className="mailBtn" href="mailto:nikhilmohanty443@gmail.com">
          <Button>Email: example@gmail.com</Button>
        </a>
        <div className="phone">
          <Button>Phone: +91 9090909090</Button>
        </div>
        <div className="address">
          <Button>Address: Odisha, India, Earth</Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
