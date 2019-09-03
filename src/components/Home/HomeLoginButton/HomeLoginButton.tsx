import React from "react";
import { Button, Col, Media, Row } from "reactstrap";
import ioLogoWhite from "../../../assets/img/io-logo-white.svg";

/**
 * props for LoginHomeButton component
 */
interface IHomeLoginButtonProps {
  buttonText: string;
  img: string;
  imgHeight: number;
  imgWidth: number;
  link?: string;
  offset?: string;
  text: string;
}

/**
 * Component defining a login element used in Home component(image, button and descriptive text)
 */
export const HomeLoginButton = (props: IHomeLoginButtonProps) => {
  return (
    <Col sm={{ size: 3, offset: props.offset }}>
      <Row>
        <Col>
          <Media
            object
            src={props.img}
            alt="NewCo Logo"
            height={props.imgHeight}
          />
        </Col>
      </Row>
      <Row className="bg-dark bg-transparent pt-4 mt-4">
        <Col>
          <Button color="primary" className="w-75">{props.buttonText}</Button>
        </Col>
      </Row>
      <Row className="bg-dark bg-transparent pt-4 mt-4">
        <Col>
          <p className="small text-white pl-4 pr-4">{props.text}</p>
        </Col>
      </Row>
    </Col>
  );
};