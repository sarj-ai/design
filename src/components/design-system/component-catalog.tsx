"use client"

import Image from "next/image"
import * as React from "react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Attachment,
  AttachmentContent,
  AttachmentGroup,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Message, MessageContent, MessageGroup } from "@/components/ui/message"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CompletedIcon,
  DeleteIcon,
  ExportIcon,
  FailedIcon,
  NarrowIcon,
  PreviewIcon,
  RowMenuIcon,
  SearchIcon,
} from "@/components/design-system/icons"
import { CATALOG_GROUPS, type CatalogGroupId } from "@/lib/design-system-data"

/**
 * Every primitive in `src/components/ui`, grouped by the job it does, each one
 * running rather than described.
 *
 * Data and demo live together here rather than splitting into `-data.ts`: the
 * demo *is* the entry's content, and JSX cannot live in a data module. The
 * group titles are the exception — the rail lists them, so they live in
 * `design-system-data.ts` and this file refers to them by id.
 *
 * Adding a primitive means adding one entry to one array.
 *
 * Three entries stand a line of prose where the specimen would go.
 * `Direction` renders nothing by design, `AnimatedBeam` measures two refs it
 * has to be given, and `MultiStepLoader` takes the whole screen — all three
 * say so rather than showing a placeholder that would be a lie about what the
 * primitive is.
 */

type Entry = {
  name: string
  /** One line, in the reader's language rather than the API's. */
  note: string
  demo?: React.ReactNode
}
type Group = { id: CatalogGroupId; entries: Entry[] }

/** Real captures rather than grey boxes: a carousel is for media, and a
    placeholder does not show that the frames are the same size. */
const CAROUSEL_CLIPS = [
  { alt: "Knowledge base", src: "/thumbs/knowledge-base.webp" },
  { alt: "Call retry", src: "/thumbs/call-retry.webp" },
  { alt: "Phone numbers", src: "/thumbs/phone-numbers.webp" },
]

const CHART_DATA = [
  { calls: 41, day: "Mon" },
  { calls: 68, day: "Tue" },
  { calls: 52, day: "Wed" },
  { calls: 74, day: "Thu" },
]

const GROUPS: Group[] = [
  {
    id: "surface",
    entries: [
      {
        name: "Card",
        note: "A titled panel. The default container for a section.",
        demo: (
          /* `w-full` because the tile centres its specimen with flex, and
             Card's own `overflow-hidden` zeroes its automatic minimum size —
             left to itself it collapses to the width of its longest word. */
          <Card className="w-full" size="sm">
            <CardHeader>
              <CardTitle>Monthly spend</CardTitle>
              <CardDescription>Billing period to date</CardDescription>
            </CardHeader>
          </Card>
        ),
      },
      {
        name: "Item",
        note: "A list row: media, title, description, actions.",
        demo: (
          <Item size="sm" variant="outline">
            <ItemMedia variant="icon">
              <PreviewIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Appointment booking</ItemTitle>
            </ItemContent>
          </Item>
        ),
      },
      {
        name: "Separator",
        note: "A rule between two things that belong apart.",
        demo: <Separator />,
      },
      {
        name: "AspectRatio",
        note: "Holds one ratio while the width changes under it.",
        demo: (
          /* Capped: at full column width a 16:9 box is the tallest thing in
             the grid and drags the whole row down with it. */
          /* Filled with `background` rather than `muted`: the tile's own
             panel is muted, and a muted box on it is an invisible specimen. */
          <div className="max-w-48">
            <AspectRatio className="rounded-md bg-background" ratio={16 / 9} />
          </div>
        ),
      },
      {
        name: "Resizable",
        note: "Two panes the reader splits for themselves.",
        demo: (
          /* Both panes carry content, because an empty one demonstrates
             nothing: the point of this primitive is that the reader decides
             how to split two things they are reading together, and with the
             panes blank the handle looks like a stray divider. This is the
             pairing the catalog names — a transcript beside its detail. */
          <ResizablePanelGroup className="h-28 rounded-md border">
            <ResizablePanel defaultSize={62}>
              <div className="flex h-full flex-col gap-1 p-3 text-sm">
                <span className="text-muted-foreground">Agent</span>
                <span>Your balance is 412 riyals.</span>
                <span className="mt-1 text-muted-foreground">Caller</span>
                <span>When is it due?</span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={38}>
              <div className="flex h-full flex-col gap-1 p-3 text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="tabular-nums">3:44</span>
                <span className="mt-1 text-muted-foreground">Outcome</span>
                <span>Resolved</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ),
      },
      {
        name: "ScrollArea",
        note: "A scrolling region wearing the house scrollbar.",
        demo: (
          <ScrollArea className="h-16 w-full rounded-md border p-2">
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>CL-8842 · Rawabi Holding</span>
              <span>CL-8841 · Nadec Foods</span>
              <span>CL-8840 · Al Bilad Bank</span>
              <span>CL-8839 · Tamimi Markets</span>
            </div>
          </ScrollArea>
        ),
      },
      {
        name: "Collapsible",
        note: "One block that folds away.",
        demo: (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="outline">
                Advanced
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
              Retry window, timezone, max attempts.
            </CollapsibleContent>
          </Collapsible>
        ),
      },
      {
        name: "Accordion",
        note: "A stack of them, one open at a time.",
        demo: (
          <Accordion collapsible type="single">
            <AccordionItem value="a">
              <AccordionTrigger>Turn detection</AccordionTrigger>
              <AccordionContent>Semantic, 480ms minimum wait.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
    ],
  },
  {
    id: "actions",
    entries: [
      {
        name: "Button",
        note: "Every action, at four sizes and four roles.",
        demo: (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Save</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </div>
        ),
      },
      {
        name: "ButtonGroup",
        note: "Buttons that act on one thing, joined up.",
        demo: (
          <ButtonGroup>
            <Button aria-label="Search" size="icon-sm" variant="outline">
              <SearchIcon />
            </Button>
            <Button aria-label="Filter" size="icon-sm" variant="outline">
              <NarrowIcon />
            </Button>
            <Button aria-label="Export" size="icon-sm" variant="outline">
              <ExportIcon />
            </Button>
          </ButtonGroup>
        ),
      },
      {
        name: "Toggle",
        note: "A single action that stays pressed.",
        demo: <Toggle aria-label="Mark reviewed">Reviewed</Toggle>,
      },
      {
        name: "ToggleGroup",
        note: "One choice, or several, shown as pressed buttons.",
        demo: (
          <ToggleGroup defaultValue="all" type="single" variant="outline">
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="in">Inbound</ToggleGroupItem>
            <ToggleGroupItem value="out">Outbound</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
    ],
  },
  {
    id: "status",
    entries: [
      {
        name: "Badge",
        note: "A status, a count, or a label.",
        demo: (
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="destructive">Failed</Badge>
          </div>
        ),
      },
      {
        name: "Avatar",
        note: "A person, as initials or a photo.",
        demo: (
          <Avatar>
            <AvatarFallback>FJ</AvatarFallback>
          </Avatar>
        ),
      },
      {
        name: "Marker",
        note: "A quiet line of context between blocks.",
        demo: (
          <Marker>
            <MarkerIcon />
            <MarkerContent>Overlaps another route</MarkerContent>
          </Marker>
        ),
      },
      {
        name: "Kbd",
        note: "A key, as it is printed on the keyboard.",
        demo: (
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>F</Kbd>
          </KbdGroup>
        ),
      },
      {
        name: "Spinner",
        note: "Something is happening; the length is unknown.",
        demo: <Spinner />,
      },
      {
        name: "Skeleton",
        note: "The shape of content that has not arrived.",
        demo: (
          /* On a surface, because a skeleton is `muted` and so is the tile's
             panel — and a loading row only ever appears inside a surface. */
          <div className="flex w-full flex-col gap-2 rounded-md bg-background p-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4" />
          </div>
        ),
      },
      {
        name: "Progress",
        note: "How far through, when the end is known.",
        demo: (
          /* Same reason as the skeleton above: the track is `muted`. */
          <div className="w-full rounded-md bg-background p-3">
            <Progress value={62} />
          </div>
        ),
      },
    ],
  },
  {
    id: "text-entry",
    entries: [
      {
        name: "Input",
        note: "One line of text.",
        demo: <Input defaultValue="Layla" />,
      },
      {
        name: "Textarea",
        note: "Several lines of it.",
        demo: <Textarea rows={2} />,
      },
      {
        name: "InputGroup",
        note: "An input with an icon, addon or button attached.",
        demo: (
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search calls" />
          </InputGroup>
        ),
      },
      {
        name: "InputOTP",
        note: "A short code, one box per character.",
        demo: (
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        ),
      },
      {
        name: "Label",
        note: "The name of a control, tied to it.",
        demo: <Label>Scenario name</Label>,
      },
    ],
  },
  {
    id: "choice",
    entries: [
      {
        name: "Select",
        note: "One option from a list short enough to scan.",
        demo: (
          <Select defaultValue="ar">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">Arabic</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ur">Urdu</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        name: "NativeSelect",
        note: "The browser's own, where that is enough.",
        demo: (
          <NativeSelect className="w-full" defaultValue="ar">
            <NativeSelectOption value="ar">Arabic</NativeSelectOption>
            <NativeSelectOption value="en">English</NativeSelectOption>
          </NativeSelect>
        ),
      },
      {
        name: "Combobox",
        note: "One option from a list too long to scan.",
        demo: (
          <Combobox>
            <ComboboxInput placeholder="Find a scenario" />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="Appointment booking">
                  Appointment booking
                </ComboboxItem>
                <ComboboxItem value="Card dispute intake">
                  Card dispute intake
                </ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ),
      },
      {
        name: "RadioGroup",
        note: "One option, with all of them visible.",
        demo: (
          <RadioGroup className="flex flex-col gap-2" defaultValue="all">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="cat-all" value="all" />
              <Label htmlFor="cat-all">Every call</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="cat-failed" value="failed" />
              <Label htmlFor="cat-failed">Failed only</Label>
            </div>
          </RadioGroup>
        ),
      },
      {
        name: "Checkbox",
        note: "A yes/no that is one of a set.",
        demo: (
          <div className="flex items-center gap-2">
            <Checkbox defaultChecked id="cat-record" />
            <Label htmlFor="cat-record">Record calls</Label>
          </div>
        ),
      },
      {
        name: "Switch",
        note: "A setting that takes effect as you flip it.",
        demo: <Switch defaultChecked />,
      },
      {
        name: "Slider",
        note: "A number in a range where the exact value is not the point.",
        demo: <Slider defaultValue={[40]} max={100} />,
      },
      {
        name: "Calendar",
        note: "A date, picked from the month it falls in.",
        demo: (
          /* Taller than the tile, so it is pinned to the top of the panel and
             cropped at the bottom — a month with its caption cut off is not a
             specimen of anything. */
          <div className="self-start">
            <Calendar className="rounded-md border" mode="single" />
          </div>
        ),
      },
    ],
  },
  {
    id: "form-structure",
    entries: [
      {
        name: "Field",
        note: "Label, control, description and error as one unit.",
        demo: (
          <Field>
            <FieldLabel htmlFor="cat-field">Display name</FieldLabel>
            <FieldDescription>
              Shown wherever the voice is picked.
            </FieldDescription>
            <Input defaultValue="Layla" id="cat-field" />
          </Field>
        ),
      },
    ],
  },
  {
    id: "data",
    entries: [
      {
        name: "Table",
        note: "Rows to compare down a column.",
        demo: (
          <div className="w-full overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-end">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Rawabi Holding</TableCell>
                  <TableCell className="text-end tabular-nums">$0.41</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ),
      },
      {
        name: "Chart",
        note: "A series, in the purple ramp.",
        demo: (
          <ChartContainer
            className="h-24 w-full"
            config={{
              calls: { color: "var(--color-chart-1)", label: "Calls" },
            }}
          >
            <BarChartDemo />
          </ChartContainer>
        ),
      },
      {
        name: "Pagination",
        note: "Moving through pages of rows.",
        demo: (
          /* A real range, not a single page: one page with Previous and Next
             either side of it is the state where pagination should not be
             rendered at all, so it taught the opposite of the rule. Sitting on
             page 2 of 12 is what makes both arrows, the current page and the
             ellipsis mean something.

             justify-start because the primitive centres itself for a page
             footer, and here it has to line up with every other example. */
          <Pagination className="justify-start">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              {[1, 2, 3].map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink href="#" isActive={page === 2}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">12</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ),
      },
    ],
  },
  {
    id: "overlays",
    entries: [
      {
        name: "Dialog",
        note: "A task that does not need the page behind it.",
        demo: (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Create voice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create voice</DialogTitle>
                <DialogDescription>
                  Name it and pick a language.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button size="sm">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ),
      },
      {
        name: "AlertDialog",
        note: "A destructive step, confirmed before it runs.",
        demo: (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                Delete agent
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this agent?</AlertDialogTitle>
                <AlertDialogDescription>
                  Its scenarios stay, and stop answering.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
      },
      {
        name: "Sheet",
        note: "A panel from an edge, over the page.",
        demo: (
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                Open sheet
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow the call list.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        ),
      },
      {
        name: "Drawer",
        note: "Configuring one thing beside the page it belongs to.",
        demo: (
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button size="sm" variant="outline">
                Open drawer
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row items-start justify-between gap-4 border-b">
                <div className="flex flex-col gap-0.5">
                  <DrawerTitle>Configure tool</DrawerTitle>
                  <DrawerDescription>Transfer destinations.</DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button aria-label="Close" size="icon-sm" variant="ghost">
                    <DeleteIcon />
                  </Button>
                </DrawerClose>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        ),
      },
      {
        name: "Popover",
        note: "A small surface anchored to what opened it.",
        demo: (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm">
              Pick which columns show.
            </PopoverContent>
          </Popover>
        ),
      },
      {
        name: "HoverCard",
        note: "A preview on hover. Never a control.",
        demo: (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button size="sm" variant="link">
                Al Bilad Bank
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="text-sm">
              14 calls this week · card dispute intake
            </HoverCardContent>
          </HoverCard>
        ),
      },
      {
        name: "Tooltip",
        note: "The name of a control that shows only an icon.",
        demo: (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Export" size="icon-sm" variant="outline">
                <ExportIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
        ),
      },
      {
        name: "DropdownMenu",
        note: "Actions on a thing, from the thing's own button.",
        demo: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Actions" size="icon-sm" variant="ghost">
                <RowMenuIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        name: "ContextMenu",
        note: "The same actions, on right-click.",
        demo: (
          <ContextMenu>
            <ContextMenuTrigger className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Copy call ID</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ),
      },
      {
        name: "Menubar",
        note: "Persistent menus across the top of a surface.",
        demo: (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Export CSV</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        ),
      },
      {
        name: "Command",
        note: "Search over commands, opened from the keyboard.",
        demo: (
          <Command className="rounded-md border">
            <CommandInput placeholder="Type a command" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup heading="Calls">
                <CommandItem>Start a call</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        ),
      },
    ],
  },
  {
    id: "navigation",
    entries: [
      {
        name: "Sidebar",
        note: "The app's own nav rail.",
        demo: (
          <div className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
            Rendered at app scale — see any mockup’s shell.
          </div>
        ),
      },
      {
        name: "NavigationMenu",
        note: "Top-level sections, with panels under them.",
        demo: (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink>Conversations</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink>Personas</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ),
      },
      {
        name: "Breadcrumb",
        note: "Where this page sits, and the way back up.",
        demo: (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Conversations</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>CL-8840</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ),
      },
    ],
  },
  {
    id: "feedback",
    entries: [
      {
        name: "Alert",
        note: "A notice that stays on the page.",
        demo: (
          <Alert>
            <CompletedIcon />
            <AlertTitle>Batch scheduled</AlertTitle>
            <AlertDescription>412 calls start at 09:00.</AlertDescription>
          </Alert>
        ),
      },
      {
        name: "Empty",
        note: "Nothing here yet, and the one action that changes that.",
        demo: (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FailedIcon />
              </EmptyMedia>
              <EmptyTitle>No calls yet</EmptyTitle>
              <EmptyDescription>
                They appear once a campaign runs.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ),
      },
      {
        name: "Sonner",
        note: "A toast: it finished, and no answer is needed.",
        demo: (
          <Button
            onClick={() => toast.success("Voice saved")}
            size="sm"
            variant="outline"
          >
            Show a toast
          </Button>
        ),
      },
    ],
  },
  {
    id: "conversation",
    entries: [
      {
        name: "Message",
        note: "One turn in a transcript.",
        demo: (
          <MessageGroup>
            <Message>
              <MessageContent>How can I help today?</MessageContent>
            </Message>
          </MessageGroup>
        ),
      },
      {
        name: "MessageScroller",
        note: "A transcript pinned to its latest turn.",
        demo: (
          <div className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
            Wraps a transcript; nothing to show on its own.
          </div>
        ),
      },
      {
        name: "Bubble",
        note: "A turn, as a chat bubble.",
        demo: (
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent>Ready when you are.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        ),
      },
      {
        name: "Attachment",
        note: "A file carried on a message.",
        demo: (
          <AttachmentGroup>
            <Attachment>
              <AttachmentContent>
                <AttachmentTitle>tariffs-2026.pdf</AttachmentTitle>
              </AttachmentContent>
            </Attachment>
          </AttachmentGroup>
        ),
      },
      {
        name: "Carousel",
        note: "Frames of media, one at a time.",
        demo: (
          /* The arrows are pinned 48px outside the carousel box, so without
             matching margin they land outside the tile. `flex-1` rather than a
             width: the tile centres its specimen with flex, and the carousel's
             own overflow clip would otherwise let it collapse to nothing. */
          <Carousel className="mx-12 min-w-0 flex-1">
            <CarouselContent>
              {CAROUSEL_CLIPS.map((clip) => (
                <CarouselItem key={clip.src}>
                  <AspectRatio
                    className="overflow-hidden rounded-md bg-muted"
                    ratio={16 / 9}
                  >
                    {/* quality 100: the source is a webp the thumbnail script
                        already wrote at q82, so the default re-encode at 75 was
                        compressing a compressed capture. UI screenshots are
                        fine text and thin rules — the first thing a second
                        pass eats.

                        sizes is the frame's real width in the tile, so a 2x
                        screen asks for 512 rather than a candidate the
                        1280-wide source could only be upscaled into. */}
                    <Image
                      alt={clip.alt}
                      className="object-cover"
                      fill
                      quality={100}
                      sizes="256px"
                      src={clip.src}
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ),
      },
    ],
  },
  {
    id: "effects",
    entries: [
      {
        name: "MultiStepLoader",
        note: "A long job, reported step by step.",
        demo: <NoSpecimen>Takes over the screen while it runs.</NoSpecimen>,
      },
      {
        name: "AnimatedBeam",
        note: "A line drawn between two elements.",
        demo: <NoSpecimen>Measures two refs it has to be given.</NoSpecimen>,
      },
      {
        name: "Direction",
        note: "Sets text direction for everything inside it.",
        demo: <NoSpecimen>Renders nothing of its own.</NoSpecimen>,
      },
    ],
  },
]

/**
 * Every primitive name, filed under the group it sits in.
 *
 * The index the rail's search runs against: the rail lists twelve group titles,
 * so without this, typing `Tooltip` finds nothing even though the page has one.
 * Derived from `GROUPS` rather than written out a second time — a list of names
 * kept beside the entries goes stale the first time one is renamed.
 */
export const PRIMITIVE_NAMES: Record<string, string[]> = Object.fromEntries(
  GROUPS.map((group) => [group.id, group.entries.map((entry) => entry.name)]),
)

/** Recharts is a peer of ChartContainer, so the chart lives in its own node. */
function BarChartDemo() {
  const [Recharts, setRecharts] = React.useState<
    null | typeof import("recharts")
  >(null)

  React.useEffect(() => {
    void import("recharts").then(setRecharts)
  }, [])

  if (!Recharts) return <Skeleton className="h-24" />

  return (
    <Recharts.BarChart data={CHART_DATA}>
      <Recharts.XAxis
        axisLine={false}
        dataKey="day"
        tickLine={false}
        tickMargin={8}
      />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Recharts.Bar dataKey="calls" fill="var(--color-calls)" radius={4} />
    </Recharts.BarChart>
  )
}

/** The line that stands in for a specimen that cannot be shown in a tile. */
function NoSpecimen({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm text-balance text-muted-foreground">
      {children}
    </span>
  )
}

/**
 * One primitive, in the shape the rest of the catalog is browsed in: the
 * component itself on an inset panel, then its name and the one line that says
 * what it is for.
 *
 * The specimen leads because it answers the question people arrive with —
 * *which one of these is the thing I am picturing* — before any name can. The
 * panel is a fixed height so that a row of tiles reads as a row rather than as
 * a stack of unrelated boxes; anything taller than that is cropped, which is
 * what a thumbnail is.
 */
function PrimitiveTile({ entry }: { entry: Entry }) {
  return (
    <Card className="gap-3" size="sm">
      <CardContent>
        {/* The frame and the padding are separate elements on purpose: radius
            + edge + padding on one div is a hand-rolled Card, which
            `sarj/use-ui-primitives` rejects. Same split ReferenceTable uses —
            the border is the wrapper's, the inset is the child's. */}
        <div className="h-44 overflow-hidden rounded-lg border">
          <div className="flex h-full items-center justify-center p-4">
            {entry.demo}
          </div>
        </div>
      </CardContent>

      <CardHeader>
        <CardTitle className="font-mono">{entry.name}</CardTitle>
        <CardDescription>{entry.note}</CardDescription>
      </CardHeader>
    </Card>
  )
}

/**
 * The inventory. Pass a group id for one shelf of it, or leave it off for all
 * twelve — which is what the Components index opens with.
 */
export function ComponentCatalog({ group }: { group?: CatalogGroupId }) {
  const shelves = group ? GROUPS.filter((shelf) => shelf.id === group) : GROUPS

  return (
    <div className="flex flex-col gap-8">
      {shelves.map((shelf) => {
        const meta = CATALOG_GROUPS.find((entry) => entry.id === shelf.id)

        return (
          <section className="flex flex-col gap-4" key={shelf.id}>
            {/* The heading is the group's own page title when one group is
                showing, so it is not repeated above itself. */}
            {group ? null : (
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">{meta?.title}</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  {meta?.description}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {shelf.entries.map((entry) => (
                <PrimitiveTile entry={entry} key={entry.name} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
