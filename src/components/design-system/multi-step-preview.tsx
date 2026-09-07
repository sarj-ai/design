"use client"

import * as React from "react"

import { toast } from "sonner"

import { FieldHint } from "@/components/design-system/field-hint"
import { WarningIcon } from "@/components/design-system/icons"
import {
  type CreateFailure,
  MultiStepCreateDialog,
} from "@/components/design-system/multi-step-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { NativeSelect } from "@/components/ui/native-select"

/**
 * One flow poured into the shell, so the standard is shown being used rather
 * than described.
 *
 * The content is the telephony connection wizard from `bulbul`, down to the
 * field names — organization, endpoint name, signaling IPs, transport, digest
 * username. Three of its steps are not here. "Collision check" asks the reader
 * nothing, and the rule beside this preview says a step that asks nothing is a
 * step to delete. "Integration type" and "Numbers" were a radio list and a
 * checkbox list: a different input shape on every step made the form read as
 * four unrelated screens rather than one, so every step is a field now.
 *
 * Explanations are an (i) beside the label, not a line under it, matching the
 * reference this form came from. Note that `AGENTS.md` defaults the other way;
 * the rule that matters either way is that a screen picks one and uses it for
 * every field, which this does.
 *
 * The first submit fails on purpose. Failure is the required part nobody
 * draws, so the preview has to reach it.
 */

const ORGANIZATIONS = ["Rawabi Holding", "Nadec Foods", "Al Bilad Bank"]
const TRANSPORTS = ["UDP", "TCP", "TLS"]
const CODECS = ["OPUS", "G.711 A-law", "G.711 μ-law", "G.722"]
const DTMF_MODES = ["RFC 2833", "SIP INFO", "In-band"]

const CREDENTIALS_STEP = 1

export function MultiStepPreview() {
  const [organization, setOrganization] = React.useState(ORGANIZATIONS[0])
  const [endpointName, setEndpointName] = React.useState("Rawabi PBX")
  const [signaling, setSignaling] = React.useState("212.118.0.0/24")
  const [transport, setTransport] = React.useState("TLS")
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [codec, setCodec] = React.useState(CODECS[0])
  const [dtmf, setDtmf] = React.useState(DTMF_MODES[0])
  const [inboundPrefix, setInboundPrefix] = React.useState("966")
  const [concurrent, setConcurrent] = React.useState("120")
  const [perSecond, setPerSecond] = React.useState("8")
  const [failover, setFailover] = React.useState("sip-2.rawabi.sa")
  const [attempts, setAttempts] = React.useState(0)

  const submit = async (): Promise<CreateFailure | null> => {
    await new Promise((resolve) => setTimeout(resolve, 900))
    setAttempts((count) => count + 1)

    if (attempts === 0) {
      return {
        message:
          "The endpoint refused the digest username. Nothing was created.",
        stepIndex: CREDENTIALS_STEP,
        title: "Credentials were rejected",
      }
    }

    return null
  }

  return (
    <MultiStepCreateDialog
      onCreated={() => toast.success(`${endpointName} is live`)}
      steps={[
        {
          title: "Endpoint details",
          description: "Who owns it, and how does the endpoint authenticate?",
          content: (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="The client this connection bills and routes to."
                  htmlFor="msp-org"
                >
                  Organization
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="msp-org"
                  onChange={(event) => setOrganization(event.target.value)}
                  value={organization}
                >
                  {ORGANIZATIONS.map((one) => (
                    <option key={one}>{one}</option>
                  ))}
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="Shown wherever this connection appears in the console."
                  htmlFor="msp-name"
                >
                  Endpoint name
                </FieldHint>
                <Input
                  id="msp-name"
                  onChange={(event) => setEndpointName(event.target.value)}
                  value={endpointName}
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="The addresses calls are signalled to. CIDR is accepted."
                  htmlFor="msp-signaling"
                >
                  Signaling IPs
                </FieldHint>
                <Input
                  id="msp-signaling"
                  onChange={(event) => setSignaling(event.target.value)}
                  value={signaling}
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="TLS unless the carrier cannot terminate it."
                  htmlFor="msp-transport"
                >
                  Transport
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="msp-transport"
                  onChange={(event) => setTransport(event.target.value)}
                  value={transport}
                >
                  {TRANSPORTS.map((one) => (
                    <option key={one}>{one}</option>
                  ))}
                </NativeSelect>
              </div>
            </div>
          ),
        },
        {
          title: "Credentials",
          description: "Authentication material for the wire.",
          content: (
            <div className="flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <FieldHint
                    hint="Issued by the carrier, not the account email."
                    htmlFor="msp-username"
                  >
                    Digest username
                  </FieldHint>
                  <Input
                    id="msp-username"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="rawabi-outbound"
                    value={username}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <FieldHint
                    hint="Stored encrypted. It is never shown again once saved."
                    htmlFor="msp-password"
                  >
                    Digest password
                  </FieldHint>
                  <Input
                    id="msp-password"
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    value={password}
                  />
                </div>
              </div>

              {/* Tied to the field being empty rather than always on: a notice
                  that is there every visit is a caption, and the reader stops
                  seeing it long before it is ever true. */}
              {username ? null : (
                <Alert>
                  {/* Unstyled on purpose: Alert sizes its own icon and forces
                      it to the alert's text colour with `*:[svg]:text-current`,
                      which outranks a class here. */}
                  <WarningIcon />
                  <AlertDescription>
                    Enter the digest username before continuing — the endpoint
                    refuses the connection without it.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ),
        },
        {
          title: "Routing",
          description: "How calls are carried once the endpoint answers.",
          content: (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="Offered first. The carrier picks from the list it supports."
                  htmlFor="msp-codec"
                >
                  Preferred codec
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="msp-codec"
                  onChange={(event) => setCodec(event.target.value)}
                  value={codec}
                >
                  {CODECS.map((one) => (
                    <option key={one}>{one}</option>
                  ))}
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="RFC 2833 unless the carrier asks for something else."
                  htmlFor="msp-dtmf"
                >
                  DTMF mode
                </FieldHint>
                <NativeSelect
                  className="w-full"
                  id="msp-dtmf"
                  onChange={(event) => setDtmf(event.target.value)}
                  value={dtmf}
                >
                  {DTMF_MODES.map((one) => (
                    <option key={one}>{one}</option>
                  ))}
                </NativeSelect>
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="Stripped from the number before the scenario sees it."
                  htmlFor="msp-prefix"
                >
                  Inbound prefix
                </FieldHint>
                {/* InputGroup rather than a bare Input: the + belongs to the
                    field, and typing it into the value is how prefixes end up
                    stored two different ways. */}
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>+</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="msp-prefix"
                    inputMode="numeric"
                    onChange={(event) => setInboundPrefix(event.target.value)}
                    value={inboundPrefix}
                  />
                </InputGroup>
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="Where calls go when this endpoint stops answering."
                  htmlFor="msp-failover"
                >
                  Failover endpoint
                </FieldHint>
                <Input
                  id="msp-failover"
                  onChange={(event) => setFailover(event.target.value)}
                  value={failover}
                />
              </div>
            </div>
          ),
        },
        {
          title: "Capacity",
          description: "What this connection is allowed to carry.",
          content: (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="Calls in flight at once. The carrier rejects the rest."
                  htmlFor="msp-concurrent"
                >
                  Concurrent calls
                </FieldHint>
                <InputGroup>
                  <InputGroupInput
                    id="msp-concurrent"
                    inputMode="numeric"
                    onChange={(event) => setConcurrent(event.target.value)}
                    value={concurrent}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>calls</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex flex-col gap-2">
                <FieldHint
                  hint="New calls per second. Above this they queue."
                  htmlFor="msp-cps"
                >
                  Dial rate
                </FieldHint>
                <InputGroup>
                  <InputGroupInput
                    id="msp-cps"
                    inputMode="numeric"
                    onChange={(event) => setPerSecond(event.target.value)}
                    value={perSecond}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>per second</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
          ),
        },
      ]}
      submit={submit}
      title="New connection"
      submitLabel="Create connection"
      submittingLabel="Creating connection"
      summary={[
        { term: "Organization", value: organization },
        { term: "Endpoint name", value: endpointName },
        { term: "Signaling IPs", value: signaling },
        { term: "Transport", value: transport },
        { term: "Digest username", value: username || "Not set" },
        { term: "Routing", value: `${codec} · DTMF ${dtmf}` },
        { term: "Inbound prefix", value: `+${inboundPrefix}` },
        { term: "Failover", value: failover },
        {
          term: "Capacity",
          value: `${concurrent} concurrent · ${perSecond}/second`,
        },
      ]}
    >
      {/* self-start: the trigger is a direct child of a flex-col CardContent,
          so without it the button stretches the full width of the card. */}
      <Button className="self-start">New connection</Button>
    </MultiStepCreateDialog>
  )
}
