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
import {
  ReferenceName,
  ReferenceTable,
} from "@/components/design-system/reference-table"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

/**
 * Every primitive in `src/components/ui`, grouped by the job it does, each one
 * running rather than described.
 *
 * Data and demo live together here rather than splitting into `-data.ts`: the
 * demo *is* the entry's content, and JSX cannot live in a data module. Adding a
 * primitive means adding one row to one array.
 *
 * Two entries carry no demo. `direction` renders nothing by design, and
 * `animated-beam` measures two refs it has to be given — both say so instead of
 * showing a placeholder that would be a lie about what the primitive is.
 */

type Entry = { name: string; demo?: React.ReactNode }
type Group = { title: string; entries: Entry[] }

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
    title: "Surface and layout",
    entries: [
      {
        name: "Card",
        demo: (
          <Card size="sm">
            <CardHeader>
              <CardTitle>Monthly spend</CardTitle>
              <CardDescription>Billing period to date</CardDescription>
            </CardHeader>
          </Card>
        ),
      },
      {
        name: "Item",
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
        demo: <Separator />,
      },
      {
        name: "AspectRatio",
        demo: (
          /* Capped: at full column width a 16:9 box is the tallest thing in
             the grid and drags the whole row down with it. */
          <div className="max-w-48">
            <AspectRatio className="rounded-md bg-muted" ratio={16 / 9} />
          </div>
        ),
      },
      {
        name: "Resizable",
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
        demo: (
          <ScrollArea className="h-16 rounded-md border p-2">
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
        demo: (
          <Accordion collapsible type="single">
            <AccordionItem value="a">
              <AccordionTrigger>Turn detection</AccordionTrigger>
              <AccordionContent>Semantic, 480ms minimum wait.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        name: "Tabs",
        demo: (
          <Tabs defaultValue="transcript">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="model">Model</TabsTrigger>
            </TabsList>
            <TabsContent
              className="pt-2 text-sm text-muted-foreground"
              value="transcript"
            >
              Four turns.
            </TabsContent>
            <TabsContent
              className="pt-2 text-sm text-muted-foreground"
              value="model"
            >
              Claude Sonnet 5.
            </TabsContent>
          </Tabs>
        ),
      },
    ],
  },
  {
    title: "Actions",
    entries: [
      {
        name: "Button",
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
        demo: <Toggle aria-label="Mark reviewed">Reviewed</Toggle>,
      },
      {
        name: "ToggleGroup",
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
    title: "Status and identity",
    entries: [
      {
        name: "Badge",
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
        demo: (
          <Avatar>
            <AvatarFallback>FJ</AvatarFallback>
          </Avatar>
        ),
      },
      {
        name: "Marker",
        demo: (
          <Marker>
            <MarkerIcon />
            <MarkerContent>Overlaps another route</MarkerContent>
          </Marker>
        ),
      },
      {
        name: "Kbd",
        demo: (
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>F</Kbd>
          </KbdGroup>
        ),
      },
      {
        name: "Spinner",
        demo: <Spinner />,
      },
      {
        name: "Skeleton",
        demo: (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4" />
          </div>
        ),
      },
      {
        name: "Progress",
        demo: <Progress value={62} />,
      },
    ],
  },
  {
    title: "Text entry",
    entries: [
      {
        name: "Input",
        demo: <Input defaultValue="Layla" />,
      },
      {
        name: "Textarea",
        demo: <Textarea rows={2} />,
      },
      {
        name: "InputGroup",
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
        demo: <Label>Scenario name</Label>,
      },
    ],
  },
  {
    title: "Choice",
    entries: [
      {
        name: "Select",
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
        demo: (
          <NativeSelect className="w-full" defaultValue="ar">
            <NativeSelectOption value="ar">Arabic</NativeSelectOption>
            <NativeSelectOption value="en">English</NativeSelectOption>
          </NativeSelect>
        ),
      },
      {
        name: "Combobox",
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
        demo: (
          <div className="flex items-center gap-2">
            <Checkbox defaultChecked id="cat-record" />
            <Label htmlFor="cat-record">Record calls</Label>
          </div>
        ),
      },
      {
        name: "Switch",
        demo: <Switch defaultChecked />,
      },
      {
        name: "Slider",
        demo: <Slider defaultValue={[40]} max={100} />,
      },
      {
        name: "Calendar",
        demo: <Calendar className="rounded-md border" mode="single" />,
      },
    ],
  },
  {
    title: "Form structure",
    entries: [
      {
        name: "Field",
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
    title: "Data",
    entries: [
      {
        name: "Table",
        demo: (
          <div className="overflow-hidden rounded-lg border">
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
    title: "Overlays",
    entries: [
      {
        name: "Dialog",
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
    title: "Navigation",
    entries: [
      {
        name: "Sidebar",
        demo: (
          <div className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
            Rendered at app scale — see any mockup’s shell.
          </div>
        ),
      },
      {
        name: "NavigationMenu",
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
    title: "Feedback",
    entries: [
      {
        name: "Alert",
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
    title: "Conversation and media",
    entries: [
      {
        name: "Message",
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
        demo: (
          <div className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
            Wraps a transcript; nothing to show on its own.
          </div>
        ),
      },
      {
        name: "Bubble",
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
        demo: (
          /* The arrows are pinned 48px outside the carousel box, so without
             matching margin they land in the neighbouring cell. With it the
             component starts on the cell's start edge, arrows included.

             Capped, because the Example column is ~940px: uncapped the frame
             filled it and a 1280x533 capture was being blown up past its own
             resolution. `sizes` has to match the cap or Next serves a file for
             the wrong width and it blurs whatever the box does. */
          <Carousel className="mx-12 max-w-sm">
            <CarouselContent>
              {CAROUSEL_CLIPS.map((clip) => (
                <CarouselItem key={clip.src}>
                  <AspectRatio
                    className="overflow-hidden rounded-md bg-muted"
                    ratio={16 / 9}
                  >
                    {/* quality 100 and a 2x sizes hint: the source is a webp
                        the thumbnail script already wrote at q82, so the
                        default re-encode at 75 was compressing a compressed
                        capture. UI screenshots are fine text and thin rules —
                        the first thing a second pass eats.

                        sizes is the frame's real width, so a 2x screen asks
                        for 768. Claiming more fetched a 1920 candidate, which
                        the 1280-wide source can only upscale into. */}
                    <Image
                      alt={clip.alt}
                      className="object-cover"
                      fill
                      quality={100}
                      sizes="384px"
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
    title: "Effects and utilities",
    entries: [
      {
        name: "MultiStepLoader",
        demo: (
          <div className="rounded-md bg-muted p-2 text-sm text-muted-foreground">
            Takes over the screen while it runs.
          </div>
        ),
      },
      {
        name: "AnimatedBeam",
      },
      {
        name: "Direction",
      },
    ],
  },
]

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

export function ComponentCatalog() {
  return (
    <div className="flex flex-col gap-8">
      {GROUPS.map((group) => (
        <section className="flex flex-col gap-3" key={group.title}>
          <h3 className="text-sm font-medium text-muted-foreground">
            {group.title}
          </h3>

          {/* One row per primitive rather than three across: the names then
              read down a single column, which is how you scan for one. */}
          <ReferenceTable
            columns={[
              { header: "Primitive", width: "w-64" },
              { header: "Example" },
            ]}
            rows={group.entries.map((entry) => ({
              key: entry.name,
              cells: [
                <ReferenceName key="name">{entry.name}</ReferenceName>,
                entry.demo ?? null,
              ],
            }))}
          />
        </section>
      ))}
    </div>
  )
}
