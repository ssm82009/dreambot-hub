
export const useDisplayPlan = (
  subscriptionName: string,
  paymentData: any,
  paymentSession: any
) => {
  const getDisplayPlan = () => {
    if (subscriptionName) {
      return subscriptionName;
    } else if (paymentData?.plan_name) {
      return paymentData.plan_name;
    } else if (paymentSession?.plan_type) {
      return paymentSession.plan_type;
    } else {
      return '';
    }
  };

  return { getDisplayPlan };
};
