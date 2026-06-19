"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ShowIf } from "@/components/utils/ShowIf";

import { useExpandedProviders } from "../../hooks/use-expanded-providers";
import { useTmdbWatchProviders } from "../../providers/TmdbWatchProvidersProvider";
import { ProviderList } from "./ProviderList";

export function StreamingServiceFilter() {
  const { providers, region } = useTmdbWatchProviders();
  const {
    expanded,
    hasHiddenProviders,
    hiddenProviders,
    setExpanded,
    triggerText,
    visibleProviders,
  } = useExpandedProviders({ providers });

  const regionLabel = region ? ` (${region})` : "";

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">
        Streaming Services{regionLabel}
      </FieldLabel>
      <ShowIf condition={hasHiddenProviders}>
        <Collapsible onOpenChange={setExpanded} open={expanded}>
          <FieldGroup data-slot="checkbox-group">
            <ProviderList providerList={visibleProviders} />
          </FieldGroup>
          <CollapsibleTrigger
            className="mt-2"
            render={<Button size="xs" type="button" variant="ghost" />}
          >
            {triggerText}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FieldGroup className="mt-2" data-slot="checkbox-group">
              <ProviderList providerList={hiddenProviders} />
            </FieldGroup>
          </CollapsibleContent>
        </Collapsible>
      </ShowIf>

      <ShowIf condition={!hasHiddenProviders}>
        <FieldGroup data-slot="checkbox-group">
          <ProviderList providerList={providers} />
        </FieldGroup>
      </ShowIf>
    </Field>
  );
}
