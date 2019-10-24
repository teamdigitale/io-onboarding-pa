import React, { useContext, useEffect } from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Button, Col, Row } from "reactstrap";
import { UserProfile } from "../../../generated/definitions/api/UserProfile";
import { TokenContext } from "../../context/token-context";
import { ICustomWindow } from "../../customTypes/CustomWindow";

interface IDashboardProps extends RouteComponentProps {
  onGetUserProfile: (userProfile: UserProfile) => void;
}

/**
 * Component for delegate dashboard
 */
export const Dashboard = withRouter((props: IDashboardProps) => {
  const tokenContext = useContext(TokenContext);

  /**
   * Create window with custom element _env_ for environment variables
   */
  const customWindow = window as ICustomWindow;

  /**
   * Given a cookie key `cookieName`, returns the value of
   * the cookie or empty string, if the key is not found.
   */
  function getCookie(cookieName: string): string {
    return (
      document.cookie
        .split(";")
        .map(c => c.trim())
        .filter(cookie => {
          return (
            cookie.substring(0, cookieName.length + 1) === `${cookieName}=`
          );
        })
        .map(cookie => {
          return decodeURIComponent(cookie.substring(cookieName.length + 1));
        })[0] || ""
    );
  }

  /**
   * Set token in token context
   */
  useEffect(() => {
    tokenContext.setToken(getCookie("sessionToken"));
  }, []);

  useEffect(() => {
    // make api call only after onMount -> token to string in any case, no longer undefined
    if (tokenContext.token !== undefined) {
      const url =
        customWindow._env_.IO_ONBOARDING_PA_API_HOST +
        ":" +
        customWindow._env_.IO_ONBOARDING_PA_API_PORT +
        "/profile";
      fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokenContext.token}`
          // 'Content-Type': 'application/json'
        },
        method: "GET"
      })
        .then(response => {
          return response.json();
        })
        .then(responseData => {
          props.onGetUserProfile(responseData);
        })
        .catch(error => {
          // TODO: manage error in promise, tracked with story #169033467
          return error;
        });
    }
  }, [tokenContext.token]);

  /**
   * Navigate to signup page
   */
  const navigateToSignUpStepOne = () => props.history.push("sign-up/1");

  return (
    <div className="Dashboard">
      <Row>
        <Col className="text-center">
          <Button color="danger" onClick={navigateToSignUpStepOne}>
            DUMMY BUTTON REGISTRATION
          </Button>
        </Col>
      </Row>
    </div>
  );
});
