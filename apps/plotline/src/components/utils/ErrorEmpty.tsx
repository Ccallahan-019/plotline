"use client";

import { Info, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { ShowIf } from "./ShowIf";

type ErrorEmptyProps = {
  description: string;
  errorMessage?: null | string;
  title: string;
};

export const ErrorEmpty = ({
  description,
  errorMessage,
  title,
}: ErrorEmptyProps) => {
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const handleClick = () => {
    setShowErrorMessage(!showErrorMessage);
  };

  const showErrorMessageContent =
    !!errorMessage && process.env.NODE_ENV === "development";

  return (
    <Card className="max-w-3xl w-full mx-auto">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia className="text-destructive" variant="icon">
              <ShieldAlert />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>

            <ShowIf condition={showErrorMessageContent}>
              <EmptyContent>
                <div className="flex flex-col gap-3">
                  <Button onClick={handleClick} size="sm" variant="destructive">
                    <Info /> Show Error Message
                  </Button>

                  <ShowIf condition={showErrorMessage}>
                    <p className="text-muted-foreground text-sm">
                      {errorMessage}
                    </p>
                  </ShowIf>
                </div>
              </EmptyContent>
            </ShowIf>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
};
