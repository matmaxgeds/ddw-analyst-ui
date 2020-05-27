import classNames from 'classnames';
import React, {
  Children,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useRef,
  useState,
  useEffect,
} from 'react';
import { Card, Tab, TabContainerProps, Button } from 'react-bootstrap';
import ReactResizeDetector from 'react-resize-detector';
import styled from 'styled-components';
import { WizardBody, WizardHeader, WizardNavigation, WizardNavigationItem, WizardFooter } from '.';
import { WizardMovingTab } from './WizardMovingTab';
import { showPreviousButton, showNextButton, showFinishButton } from './utils';

interface WizardProps extends TabContainerProps {
  steps?: WizardStep[];
  onPrevious?: (step: WizardStep) => void;
  onNext?: (step: WizardStep) => void;
  onFinish?: (step: WizardStep) => void;
  showNext?: boolean;
}

export interface WizardStep {
  key: string;
  caption?: string;
  active?: boolean;
  onLoad?: () => void;
  beforeNext?: () => void;
}

const StyledCard = styled(Card)`
  opacity: 1;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
`;

const Wizard: FunctionComponent<WizardProps> = ({
  children,
  steps,
  onPrevious,
  onNext,
  onFinish,
  showNext,
  ...props
}) => {
  const [activeStep, setActiveStep] = useState(steps?.find((step) => step.active));
  const [width, setWidth] = useState(0);
  const wizardNode = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const currentActiveStep = steps?.find((step) => step.active);
    if (currentActiveStep && currentActiveStep.key !== activeStep?.key) {
      setActiveStep(currentActiveStep);
    }
  }, [steps]);

  const onSelect = (activeKey: string): void =>
    setActiveStep(steps?.find((item) => activeKey.includes(item.key)));

  const renderWizardNavigation = (): ReactNode => {
    if (steps && steps?.length) {
      const col = Math.ceil(12 / steps.length);

      return steps.map(({ caption, key }) => (
        <WizardNavigationItem
          key={key}
          active={activeStep?.key === key}
          eventKey={key}
          className={classNames(`col-sm-6 col-lg-${col}`)}
          onSelect={onSelect}
        >
          {caption}
        </WizardNavigationItem>
      ));
    }

    return null;
  };

  const onResize = (width: number): void => setWidth(width);
  const onBack = (): void => {
    if (onPrevious && activeStep) onPrevious(activeStep);
  };
  const onForward = (): void => {
    if (onNext && activeStep) onNext(activeStep);
  };
  const onComplete = (): void => {
    if (onFinish && activeStep) onFinish(activeStep);
  };

  return (
    <div className="wizard-container" ref={wizardNode}>
      <Tab.Container {...props}>
        <StyledCard className="card-wizard" data-color="red">
          {Children.map(children, (child) =>
            isValidElement(child) && child.type === WizardHeader ? child : null,
          )}
          <WizardNavigation>
            {renderWizardNavigation()}
            {steps && steps.length && width && activeStep ? (
              <WizardMovingTab steps={steps} wizardWidth={width} activeKey={activeStep.key}>
                {activeStep.caption}
              </WizardMovingTab>
            ) : null}
          </WizardNavigation>
          {Children.map(children, (child) =>
            isValidElement(child) && (child.type === WizardBody || child.type === WizardFooter)
              ? child
              : null,
          )}
          <WizardFooter>
            <div className="mr-auto">
              <Button
                className={classNames('btn-previous btn-fill btn-wd btn-default', {
                  disabled: !showPreviousButton(steps, activeStep),
                })}
                onClick={onBack}
              >
                Previous
              </Button>
            </div>
            <div className="ml-auto">
              <Button
                variant="danger"
                className={classNames('btn btn-next btn-fill btn-wd', {
                  disabled: !showNext || !showNextButton(steps, activeStep),
                })}
                onClick={onForward}
              >
                Next
              </Button>
              <Button
                variant="danger"
                className={classNames('btn btn-fill btn-wd', {
                  disabled: !showFinishButton(steps, activeStep),
                })}
                name="finish"
                onClick={onComplete}
              >
                Finish
              </Button>
            </div>
            <div className="clearfix"></div>
          </WizardFooter>
        </StyledCard>
        <ReactResizeDetector handleWidth handleHeight onResize={onResize} />
      </Tab.Container>
    </div>
  );
};

export { Wizard };
