import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface StaffData {
  category: string;
  username: string;
  mobile: string;
  email: string;
  dob: string;
  age: string;
  title: string;
  qualification: string;
  aadhaar: string;
  bloodGroup: string;
  tshirtSize: string;
  profilePhoto: string | File | null;
  residentialAddress: string;
  city: string;
  state: string;
  district: string;
  postalCode: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
}

interface StaffFormProps {
  onClose: () => void;
  onSubmit: (data: StaffData) => void;
  mode: "add" | "edit";
  initialData?: StaffData | null;
}

const initialStaffData: StaffData = {
  category: "teaching",
  username: "",
  mobile: "",
  email: "",
  dob: "",
  age: "",
  title: "",
  qualification: "",
  aadhaar: "",
  bloodGroup: "",
  tshirtSize: "",
  profilePhoto: null,
  residentialAddress: "",
  city: "",
  state: "",
  district: "",
  postalCode: "",
  bankName: "",
  ifscCode: "",
  accountNumber: "",
};

export const StaffForm: React.FC<StaffFormProps> = ({
  onClose,
  onSubmit,
  mode,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [formData, setFormData] = useState<StaffData>(initialStaffData);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData((prevData) => ({
        ...initialStaffData,
        ...initialData,
      }));
      setActiveTab("personal"); // Start with personal tab when editing
    } else {
      setFormData(initialStaffData);
      setActiveTab("personal"); // Start with personal tab for add mode
    }
  }, [mode, initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: fileInput.files ? fileInput.files[0] : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const validateTab = (tab: string): boolean => {
    switch (tab) {
      case "personal":
        return !!formData.username && !!formData.mobile && !!formData.email;
      case "address":
        return (
          !!formData.residentialAddress && !!formData.city && !!formData.state
        );
      case "bank":
        return (
          !!formData.bankName && !!formData.ifscCode && !!formData.accountNumber
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeTab === "personal" && validateTab("personal")) {
      setActiveTab("address");
    } else if (activeTab === "address" && validateTab("address")) {
      setActiveTab("bank");
    }
  };

  const handlePrevious = () => {
    if (activeTab === "address") {
      setActiveTab("personal");
    } else if (activeTab === "bank") {
      setActiveTab("address");
    }
  };

  const handleSubmit = () => {
    if (
      validateTab("personal") &&
      validateTab("address") &&
      validateTab("bank")
    ) {
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Staff Category</Label>
        <RadioGroup
          value={formData.category}
          className="flex space-x-4 mt-2"
          onValueChange={handleCategoryChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="teaching" id="teaching" />
            <Label htmlFor="teaching">Teaching</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-teaching" id="non-teaching" />
            <Label htmlFor="non-teaching">Non-Teaching</Label>
          </div>
        </RadioGroup>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="personal"
            onClick={() => setActiveTab("personal")}
          >
            Personal Details
          </TabsTrigger>
          <TabsTrigger value="address" onClick={() => setActiveTab("address")}>
            Address
          </TabsTrigger>
          <TabsTrigger value="bank" onClick={() => setActiveTab("bank")}>
            Bank Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile No</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Id</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Select
                name="title"
                value={formData.title}
                onValueChange={(value) =>
                  handleInputChange({ target: { name: "title", value } } as any)
                }
              >
                <SelectTrigger id="title">
                  <SelectValue placeholder="Select title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr</SelectItem>
                  <SelectItem value="miss">Miss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input
                id="aadhaar"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Input
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="tshirtSize">T-shirt Size</Label>
              <Input
                id="tshirtSize"
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="profilePhoto">Profile Photo</Label>
            <Input
              id="profilePhoto"
              name="profilePhoto"
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />
            {formData.profilePhoto && (
              <p className="mt-2 text-sm text-gray-500">
                {typeof formData.profilePhoto === "string"
                  ? `Current file: ${formData.profilePhoto}`
                  : `Selected file: ${(formData.profilePhoto as File).name}`}
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <div>
            <Label htmlFor="residentialAddress">Residential Address</Label>
            <Textarea
              id="residentialAddress"
              name="residentialAddress"
              value={formData.residentialAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        {activeTab === "personal" && (
          <Button onClick={handleNext} disabled={!validateTab(activeTab)}>
            Next
          </Button>
        )}

        {activeTab === "address" && (
          <>
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!validateTab(activeTab)}>
              Next
            </Button>
          </>
        )}

        {activeTab === "bank" && (
          <>
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
            <Button onClick={handleSubmit} disabled={!validateTab(activeTab)}>
              {mode === "add" ? "Save" : "Update"}
            </Button>
          </>
        )}

        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
