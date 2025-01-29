import React from 'react'
import { SaralCard } from '../ui/common/SaralCard'
import { Bell, Mail, MapPin, Phone } from 'lucide-react'
import { Label } from '@radix-ui/react-label'
import { Switch } from '@radix-ui/react-switch'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

export default function GeneralSettings() {
    return (
        <div>
            <SaralCard title=" School Information" description="Update your school's basic information and contact details">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">School Name</Label>
                <Input id="name" placeholder="Enter school name" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </div>
                  </Label>
                  <Input id="email" type="email" placeholder="school@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </div>
                  </Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </div>
                </Label>
                <Textarea id="address" placeholder="Enter school address" className="resize-none" rows={3} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
            </SaralCard>
        </div>

    )
}
