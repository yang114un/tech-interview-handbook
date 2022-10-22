import { startOfMonth } from 'date-fns';
import { useState } from 'react';
import { Button } from '@tih/ui';

import type { Month } from '~/components/shared/MonthYearPicker';
import MonthYearPicker from '~/components/shared/MonthYearPicker';

import CompanyTypeahead from '../typeahead/CompanyTypeahead';
import LocationTypeahead from '../typeahead/LocationTypeahead';
import RoleTypeahead from '../typeahead/RoleTypeahead';

export type CreateQuestionEncounterData = {
  company: string;
  location: string;
  role: string;
  seenAt: Date;
};

export type CreateQuestionEncounterFormProps = {
  onCancel: () => void;
  onSubmit: (data: CreateQuestionEncounterData) => void;
};

export default function CreateQuestionEncounterForm({
  onCancel,
  onSubmit,
}: CreateQuestionEncounterFormProps) {
  const [step, setStep] = useState(0);

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfMonth(new Date()),
  );

  return (
    <div className="flex items-center gap-2">
      <p className="font-md text-md text-slate-600">I saw this question at</p>
      {step === 0 && (
        <div>
          <CompanyTypeahead
            isLabelHidden={true}
            placeholder="Other company"
            suggestedCount={3}
            onSelect={({ value: company }) => {
              setSelectedCompany(company);
            }}
            onSuggestionClick={({ value: company }) => {
              setSelectedCompany(company);
              setStep(step + 1);
            }}
          />
        </div>
      )}
      {step === 1 && (
        <div>
          <LocationTypeahead
            isLabelHidden={true}
            placeholder="Other location"
            suggestedCount={3}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onQueryChange={() => {}}
            onSelect={({ value: location }) => {
              setSelectedLocation(location);
            }}
            onSuggestionClick={({ value: location }) => {
              setSelectedLocation(location);
              setStep(step + 1);
            }}
          />
        </div>
      )}
      {step === 2 && (
        <div>
          <RoleTypeahead
            isLabelHidden={true}
            placeholder="Other role"
            suggestedCount={3}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onQueryChange={() => {}}
            onSelect={({ value: role }) => {
              setSelectedRole(role);
            }}
            onSuggestionClick={({ value: role }) => {
              setSelectedRole(role);
              setStep(step + 1);
            }}
          />
        </div>
      )}
      {step === 3 && (
        <MonthYearPicker
          monthLabel=""
          value={{
            month: ((selectedDate?.getMonth() ?? 0) + 1) as Month,
            year: selectedDate?.getFullYear() as number,
          }}
          yearLabel=""
          onChange={(value) => {
            setSelectedDate(
              startOfMonth(new Date(value.year, value.month - 1)),
            );
          }}
        />
      )}
      {step < 3 && (
        <Button
          disabled={
            (step === 0 && selectedCompany === null) ||
            (step === 1 && selectedLocation === null) ||
            (step === 2 && selectedRole === null)
          }
          label="Next"
          variant="primary"
          onClick={() => {
            setStep(step + 1);
          }}
        />
      )}
      {step === 3 && (
        <Button
          label="Submit"
          variant="primary"
          onClick={() => {
            if (
              selectedCompany &&
              selectedLocation &&
              selectedRole &&
              selectedDate
            ) {
              onSubmit({
                company: selectedCompany,
                location: selectedLocation,
                role: selectedRole,
                seenAt: selectedDate,
              });
            }
          }}
        />
      )}
      <Button
        label="Cancel"
        variant="tertiary"
        onClick={(event) => {
          event.preventDefault();
          onCancel();
        }}
      />
    </div>
  );
}