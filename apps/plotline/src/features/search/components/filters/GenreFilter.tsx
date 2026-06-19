"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ShowIf } from "@/components/utils/ShowIf";

import { useExpandedGenres } from "../../hooks/use-expanded-genres";
import { useTmdbGenres } from "../../providers/TmdbGenresProvider";
import { GenreList } from "./GenreList";

export function GenreFilter() {
  const { discoverGenres } = useTmdbGenres();
  const {
    expanded,
    hasHiddenGenres,
    hiddenGenres,
    setExpanded,
    triggerText,
    visibleGenres,
  } = useExpandedGenres({ genres: discoverGenres });

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">Genre</FieldLabel>
      <ShowIf condition={hasHiddenGenres}>
        <Collapsible onOpenChange={setExpanded} open={expanded}>
          <FieldGroup data-slot="checkbox-group">
            <GenreList genreList={visibleGenres} />
          </FieldGroup>
          <CollapsibleTrigger
            className="mt-2"
            render={<Button size="xs" type="button" variant="ghost" />}
          >
            {triggerText}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FieldGroup className="mt-2" data-slot="checkbox-group">
              <GenreList genreList={hiddenGenres} />
            </FieldGroup>
          </CollapsibleContent>
        </Collapsible>
      </ShowIf>

      <ShowIf condition={!hasHiddenGenres}>
        <FieldGroup data-slot="checkbox-group">
          <GenreList genreList={discoverGenres} />
        </FieldGroup>
      </ShowIf>
    </Field>
  );
}
