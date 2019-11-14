import { NonEmptyString } from "italia-ts-commons/lib/strings";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Route, RouteComponentProps, withRouter } from "react-router";
import { EmailAddress } from "../../../generated/definitions/api/EmailAddress";
import { FiscalCode } from "../../../generated/definitions/api/FiscalCode";
import { UserProfile } from "../../../generated/definitions/api/UserProfile";
import { UserRole } from "../../../generated/definitions/api/UserRole";
import { LoadingPageContext } from "../../context/loading-page-context";
import { ICustomWindow } from "../../customTypes/CustomWindow";
import { AppAlert } from "../AppAlert/AppAlert";
import { CentralHeader } from "../CentralHeader/CentralHeader";
import { Dashboard } from "../Dashboard/Dashboard";
import { LoadingPage } from "../LoadingPage/LoadingPage";
import { AddMailModal } from "../Modal/AddMailModal";
import { RegistrationContainer } from "../Registration/RegistrationContainer";
import { SlimHeader } from "../SlimHeader/SlimHeader";
import { SpidLogin } from "../SpidLogin/SpidLogin";
import { UserProfile as UserProfileComponent } from "../UserProfile/UserProfile";

/**
 * part of Default Container state responsible of user profile entity
 */
interface IDefaultContainerUserProfileState {
  email: EmailAddress;
  family_name: string;
  fiscal_code: FiscalCode;
  given_name: string;
  role: UserRole;
  work_email?: EmailAddress;
}

/**
 * Component containing slim header, central header and app body with second level routing
 */
export const DefaultContainer = withRouter(props => {
  const loadingPageContext = useContext(LoadingPageContext);

  const [cookies] = useCookies(["sessionToken"]);

  /**
   * Create window with custom element _env_ for environment variables
   */
  const customWindow = (window as unknown) as ICustomWindow;

  /**
   * Initial state for user profile
   */
  const initialUserProfile: UserProfile = {
    email: "" as EmailAddress,
    family_name: "",
    fiscal_code: "" as FiscalCode,
    given_name: "",
    role: "" as UserRole,
    work_email: undefined
  };

  const [userProfile, setUserProfile] = useState<
    IDefaultContainerUserProfileState
  >(initialUserProfile);

  const [isVisibleAddMailModal, setIsVisibleAddMailModal] = useState(false);

  /*
   * Handle response from getUserProfile
   * */
  const handleGetUserProfile = (newUserProfile: UserProfile) => {
    setUserProfile(newUserProfile);
  };

  /*
   * Handle work mail set from modal and profile
   * */
  const handleWorkMailSet = (newWorkMail: EmailAddress) => {
    setUserProfile((prevState: UserProfile) => {
      return { ...prevState, work_email: newWorkMail };
    });
  };

  /*
   * Function to open/close add mail modal
   * */
  const toggleAddMailModal = () => {
    setIsVisibleAddMailModal((prevState: boolean) => !prevState);
  };

  /**
   * Set token in token context
   */
  useEffect(() => {
    // if cookies does not contain sessionToken prop and the user is not in pre login page (where token still has to be set),
    // it means the token has expired and browser deleted it -> redirect user to login
    // TODO: when available, show logout modal (tracked in story https://www.pivotaltracker.com/story/show/169033467)
    const isTokenExpired =
      !cookies.sessionToken &&
      location.pathname !== "/spid-login" &&
      customWindow._env_.IO_ONBOARDING_PA_IS_MOCK_ENV !== "1";
    if (isTokenExpired) {
      props.history.push("/home");
    }
  }, [location.pathname]);

  useEffect(() => {
    // make api call only after onMount because token is string in any case, no longer undefined, and only if userProfile is not set and user is not on spid login page
    const isTokenValidAndUserProfileUnset =
      NonEmptyString.is(cookies.sessionToken) &&
      !NonEmptyString.is(userProfile.given_name) &&
      location.pathname !== "/spid-login";
    if (isTokenValidAndUserProfileUnset) {
      const url =
        customWindow._env_.IO_ONBOARDING_PA_API_HOST +
        ":" +
        customWindow._env_.IO_ONBOARDING_PA_API_PORT +
        "/profile";
      // TODO: use generated classes for api (tracked in story https://www.pivotaltracker.com/story/show/169454440
      fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${cookies.sessionToken}`
          // 'Content-Type': 'application/json'
        },
        method: "GET"
      })
        .then(response => {
          return response.json();
        })
        .then(responseData => {
          handleGetUserProfile(responseData);
          if (!responseData.work_email) {
            toggleAddMailModal();
          }
        })
        .catch(error => {
          // TODO: manage error in promise, tracked with story #169033467
          return error;
        });
    }
  }, [cookies.sessionToken]);

  const navigateToRegistration = (registrationProps: RouteComponentProps) => (
    <RegistrationContainer
      {...registrationProps}
      userFiscalCode={userProfile.fiscal_code}
    />
  );

  const navigateToUserProfile = (userProfileProps: RouteComponentProps) => (
    <UserProfileComponent
      {...userProfileProps}
      userProfile={userProfile}
      toggleAddMailModal={toggleAddMailModal}
    />
  );

  return (
    <div className="DefaultContainer">
      {!loadingPageContext.loadingPage.isVisible ? (
        <Fragment>
          <SlimHeader />
          <CentralHeader
            userName={`${userProfile.given_name} ${userProfile.family_name}`}
            userRole={userProfile.role}
          />
        </Fragment>
      ) : null}
      <div>
        <AppAlert />
        <Route path="/spid-login" component={SpidLogin} />
        <Route
          path="/sign-up/:signUpStep"
          exact={true}
          render={navigateToRegistration}
        />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" render={navigateToUserProfile} />
      </div>
      <AddMailModal
        isVisibleAddMailModal={isVisibleAddMailModal}
        toggleAddMailModal={toggleAddMailModal}
        spidMail={userProfile.email}
        workMail={userProfile.work_email}
        onWorkMailSet={handleWorkMailSet}
      />
      {loadingPageContext.loadingPage.isVisible ? <LoadingPage /> : null}
    </div>
  );
});
