import "./CentralHeader.css";

import { AppHeader } from "@coreui/react";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import React, { ComponentProps, useContext } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps, withRouter } from "react-router";
import {
  Badge,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Media,
  Nav,
  Row,
  UncontrolledDropdown
} from "reactstrap";

import { UserRoleEnum } from "../../../generated/definitions/api/UserRole";
import bootstrapItaliaImages from "../../assets/img/bootstrap-italia/sprite.svg";
import ioLogoWhite from "../../assets/img/io-logo-white.svg";
import { LogoutModalContext } from "../../context/logout-modal-context";

/*
 * Component for badge containing user role
 */
const UserRoleBadge = (props: { userRole: string }) => {
  const { t } = useTranslation();
  /**
   * switch from user role enum to string
   */
  const badgeText = (userRoleEnum => {
    switch (userRoleEnum) {
      case UserRoleEnum.ORG_DELEGATE:
        return t("common.user.roles.delegateShort");
      case UserRoleEnum.DEVELOPER:
        return t("common.user.roles.developer");
      case UserRoleEnum.ORG_MANAGER:
        return t("common.user.roles.legalRepShort");
      case UserRoleEnum.ADMIN:
        return t("common.user.roles.admin");
    }
  })(props.userRole);

  return <Badge color="white">{badgeText}</Badge>;
};

/**
 * Props for central header
 */
interface IUserNameWithDropdownProps
  extends ComponentProps<typeof UserRoleBadge>,
    RouteComponentProps {
  userName: string;
}

/**
 *  Component for user icon
 */
const UserIcon = () => {
  return (
    <svg className="icon icon-white">
      <use xlinkHref={`${bootstrapItaliaImages}#it-user`} />
    </svg>
  );
};

/*
 * Component for user name and role with dropdown
 */
const UserNameWithDropdown = withRouter((props: IUserNameWithDropdownProps) => {
  const { t } = useTranslation();

  const logoutModalContext = useContext(LogoutModalContext);

  /**
   * function to navigate to profile
   */
  const navigateToProfile = () => props.history.push("/profile");

  const showLogoutModal = () => {
    logoutModalContext.setLogoutModal({
      isFromExpiredToken: false,
      isLogoutModalVisible: true
    });
  };

  const userRoleBadge = NonEmptyString.is(props.userRole) ? (
    <UserRoleBadge userRole={props.userRole} />
  ) : null;

  const userIcon = NonEmptyString.is(props.userName.trim()) ? (
    <UserIcon />
  ) : null;

  return (
    <Nav className="ml-auto" navbar={true}>
      <UncontrolledDropdown nav={true} direction="down">
        <DropdownToggle nav={true} className="text-white pb-0">
          <Row>
            <Col sm="2">{userIcon}</Col>
            <Col sm="5" className="mt-auto">
              <p className="mb-0 user-name-par text-truncate">
                {props.userName}
              </p>
            </Col>
            <Col sm="5" className="mt-auto text-truncate">
              {userRoleBadge}
            </Col>
          </Row>
        </DropdownToggle>
        <DropdownMenu right={true}>
          <DropdownItem onClick={navigateToProfile}>
            {t("common.buttons.profile")}
          </DropdownItem>
          <DropdownItem onClick={showLogoutModal}>
            {t("common.buttons.logout")}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </Nav>
  );
});

/**
 * Central header right below Slim header, containing app title and user name and user role with dropdown to go to profile page and logout
 */
export const CentralHeader = (
  props: ComponentProps<typeof UserNameWithDropdown>
) => {
  /**
   * react-i18next translation hook
   */
  const { t } = useTranslation();

  const userNameWithDropdown =
    props.userName !== "" ? (
      <UserNameWithDropdown
        userRole={props.userRole}
        userName={props.userName}
      />
    ) : null;

  return (
    <AppHeader
      fixed={true}
      className="CentralHeader it-header-center-wrapper border-bottom-0 w-100"
    >
      <div className="w-100">
        <Container fluid={true}>
          <Row className="align-items-center">
            <Col sm="2" className="text-right">
              <Media
                object={true}
                src={ioLogoWhite}
                alt="Io Logo"
                width="64"
                height="52"
              />
            </Col>
            <Col sm="8">
              <Row className="text-white">
                <Col sm="auto" className="ml-2">
                  <Row>
                    <Col>
                      <h4 className="font-weight-bold mb-0">
                        {t("centralHeader.title")}
                      </h4>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <p className="mb-0">{t("centralHeader.subtitle")}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col sm="2" className="text-white">
              {userNameWithDropdown}
            </Col>
          </Row>
        </Container>
      </div>
    </AppHeader>
  );
};
