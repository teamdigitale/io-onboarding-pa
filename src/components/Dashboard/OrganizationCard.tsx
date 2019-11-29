import React, { ComponentProps, Fragment, useContext } from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { Button, Card, CardBody, Col, Media, Row } from "reactstrap";
import { Organization } from "../../../generated/definitions/api/Organization";
import { OrganizationRegistrationStatusEnum } from "../../../generated/definitions/api/OrganizationRegistrationStatus";
import dashboardStart from "../../assets/img/dashboard_start.svg";
import documentsWaiting from "../../assets/img/institution_document_approval_waiting.svg";
import { AlertContext } from "../../context/alert-context";
import { LogoutModalContext } from "../../context/logout-modal-context";
import {
  baseUrlBackendClient,
  manageErrorReturnCodes
} from "../../utils/api-utils";

interface IOrganizationCardProps {
  userOrganizations: ReadonlyArray<Organization>;
}

interface IOrganizationCardInfoSectionProps {
  organization: Organization;
  organizationStatus: OrganizationRegistrationStatusEnum;
}

interface IButtonInfoSectionProps {
  text: string;
  onClick: () => void;
}

const OrganizationCardImageSection = () => {
  // Add organization image management when image is added to getOrganization api, tracked in story https://www.pivotaltracker.com/story/show/170026982
  const noImageSvg = (
    <svg height="120" width="120">
      <circle cx="60" cy="60" r="60" fill="#CFD9E4" />
    </svg>
  );

  return (
    <Row>
      <Col>{noImageSvg}</Col>
    </Row>
  );
};

const OrganizationDetailsSection = (
  organization: ComponentProps<
    typeof OrganizationCardInfoSection
  >["organization"]
) => {
  const { t } = useTranslation();

  const organizationInfoLabelsAndValues: ReadonlyArray<{
    label: string;
    value: string;
  }> = [
    {
      label: t(
        "dashboard.mainColumn.organizationRow.organizationCard.organizationDetails.ipaCode"
      ),
      value: organization.ipa_code
    },
    {
      label: t(
        "dashboard.mainColumn.organizationRow.organizationCard.organizationDetails.fc"
      ),
      value: organization.fiscal_code
    },
    {
      label: t(
        "dashboard.mainColumn.organizationRow.organizationCard.organizationDetails.pec"
      ),
      value: organization.pec
    },
    // add users label and values only if I have users
    ...(organization.users
      ? [
          {
            label: t(
              "dashboard.mainColumn.organizationRow.organizationCard.organizationDetails.orgDelegates"
            ),
            value: organization.users
              .map(user => `${user.given_name} ${user.family_name}`)
              .join(",")
          }
        ]
      : [])
  ];

  const orgInfoLabelsAndValuesComponent = organizationInfoLabelsAndValues.map(
    organizationInfoLabelAndValue => (
      <p key={organizationInfoLabelAndValue.label}>
        <b>{organizationInfoLabelAndValue.label}: </b>
        {organizationInfoLabelAndValue.value}
      </p>
    )
  );

  return <Fragment>{orgInfoLabelsAndValuesComponent}</Fragment>;
};

const ButtonInfoSection = (props: IButtonInfoSectionProps) => {
  return (
    <Button color="primary" className="btn btn-primary" onClick={props.onClick}>
      {props.text}
    </Button>
  );
};

const OrganizationCardInfoSection = (
  props: IOrganizationCardInfoSectionProps
) => {
  const { t } = useTranslation();

  const [cookies] = useCookies(["sessionToken"]);

  const alertContext = useContext(AlertContext);
  const showGenericErrorAlert = () => {
    alertContext.setAlert({
      alertColor: "danger",
      alertText: t("common.errors.genericError.500"),
      showAlert: true
    });
  };

  const logoutModalContext = useContext(LogoutModalContext);

  const infoSectionTitle = <h3 className="mb-4">{props.organization.name}</h3>;

  const infoSectionParagraph = (
    <OrganizationDetailsSection {...props.organization} />
  );

  const onSendDocuments = () => {
    const params = {
      ipaCode: props.organization.ipa_code as string
    };
    baseUrlBackendClient(cookies.sessionToken)
      .sendDocuments({
        ...params
      })
      .then(response => {
        if (response.isRight()) {
          const respValue = response.value;
          if (respValue.status === 204) {
            alertContext.setAlert({
              alertColor: "info",
              alertText: t("common.alerts.documentsSentAgain"),
              showAlert: true
            });
          } else {
            const alertText =
              t(`common.errors.sendDocuments.${respValue.status}`) ||
              t(`common.errors.genericError.${respValue.status}`);
            manageErrorReturnCodes(
              respValue.status,
              () =>
                alertContext.setAlert({
                  alertColor: "danger",
                  alertText,
                  showAlert: true
                }),
              () =>
                logoutModalContext.setLogoutModal({
                  isFromExpiredToken: true,
                  isLogoutModalVisible: true
                })
            );
          }
        } else {
          // tslint:disable-next-line:no-console
          console.log(response.value.map(v => v.message).join(" - "));
          showGenericErrorAlert();
        }
      })
      .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.log(error.message);
        showGenericErrorAlert();
      });
  };

  // Set button only if organization is not completely registered
  const infoSectionButton =
    props.organizationStatus ===
    OrganizationRegistrationStatusEnum.REGISTERED ? null : (
      <ButtonInfoSection
        text={t("common.buttons.sendDocumentsAgain")}
        onClick={onSendDocuments}
      />
    );

  return (
    <Col sm={8}>
      <Row>
        <Col>{infoSectionTitle}</Col>
      </Row>
      <Row>
        <Col>{infoSectionParagraph}</Col>
      </Row>
      <Row>
        <Col>{infoSectionButton}</Col>
      </Row>
    </Col>
  );
};

const PreDraftInfoSection = withRouter(props => {
  const { t } = useTranslation();

  const navigateToSignUpStepOne = () => props.history.push("sign-up/1");

  return (
    <Col sm={10}>
      <Row>
        <Col>
          <p>
            {t(
              "dashboard.mainColumn.organizationRow.organizationCard.noOrganizationText"
            )}
          </p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <ButtonInfoSection
            text={t("common.buttons.goToRegistration")}
            onClick={navigateToSignUpStepOne}
          />
        </Col>
      </Row>
    </Col>
  );
});

const OrganizationCardIcon = (props: {
  orgStatus: ComponentProps<
    typeof OrganizationCardInfoSection
  >["organizationStatus"];
}) => {
  const src =
    props.orgStatus === OrganizationRegistrationStatusEnum.PRE_DRAFT
      ? dashboardStart
      : documentsWaiting;
  return (
    <Media object={true} src={src} alt="organization_card_icon" height={100} />
  );
};

export const OrganizationCard = (props: IOrganizationCardProps) => {
  const hasUserOrganizations = props.userOrganizations.length > 0;
  // organization status, if no organization is present the user hasn't registered organizations yet , so it is still in pre-draft status
  const organizationStatus = hasUserOrganizations
    ? props.userOrganizations[0].registration_status
    : OrganizationRegistrationStatusEnum.PRE_DRAFT;

  return (
    <div className="InstitutionCard card-wrapper card-space">
      <Card className="card-bg card-big">
        <CardBody>
          <Row>
            {/*if user has an organization not in pre-draft status, show image section on the left*/}
            {organizationStatus !==
            OrganizationRegistrationStatusEnum.PRE_DRAFT ? (
              <Col sm={2}>
                <OrganizationCardImageSection />
              </Col>
            ) : null}
            {/*if user has an organization not in pre-draft status, show organization info*/}
            {organizationStatus ===
            OrganizationRegistrationStatusEnum.PRE_DRAFT ? (
              <PreDraftInfoSection />
            ) : (
              <OrganizationCardInfoSection
                organization={props.userOrganizations[0]}
                organizationStatus={organizationStatus}
              />
            )}
            <Col>
              {/*if organization is registered there is no icon on the right*/}
              {organizationStatus ===
              OrganizationRegistrationStatusEnum.REGISTERED ? null : (
                <OrganizationCardIcon orgStatus={organizationStatus} />
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};
