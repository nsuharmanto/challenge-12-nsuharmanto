import React, { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Container = ({ children }: Props) => (
  <div className="w-full mx-auto">{children}</div>
);

export default Container;