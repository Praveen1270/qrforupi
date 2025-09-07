"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { QRCodeSVG } from "qrcode.react"
import { Download, Share } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UPIQRGenerator() {
  const [upiId, setUpiId] = useState("")
  const [amount, setAmount] = useState("")
  const [qrValue, setQrValue] = useState("")
  const { toast } = useToast()

  const generateQR = () => {
    if (!upiId.trim()) {
      toast({
        title: "UPI ID Required",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      })
      return
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${encodeURIComponent(amount)}&cu=INR&tn=Payment`
    setQrValue(upiUrl)

    toast({
      title: "QR Code Generated",
      description: "Your UPI QR code is ready for use",
    })
  }

  const downloadQR = () => {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)

      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `UPI-QR-${upiId}-${amount}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const shareQR = async () => {
    try {
      const svg = document.getElementById("qr-code")
      if (!svg) return

      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(async (blob) => {
          if (!blob) return

          const file = new File([blob], `UPI-QR-${upiId}-${amount}.png`, { type: "image/png" })

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "UPI Payment QR Code",
              text: `Pay ₹${amount} to ${upiId} using this QR code`,
              files: [file],
            })
            toast({
              title: "Shared Successfully",
              description: "QR code shared successfully",
            })
          } else {
            await navigator.clipboard.writeText(qrValue)
            toast({
              title: "Link Copied",
              description: "UPI payment link copied to clipboard for sharing",
            })
          }
        }, "image/png")
      }

      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    } catch (err) {
      toast({
        title: "Share Failed",
        description: "Unable to share QR code",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">QR for UPI</h1>
        </div>

        {/* Form Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">Payment Details</CardTitle>
            <CardDescription>Enter your UPI ID and amount to generate QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upi-id" className="text-sm font-medium">
                UPI ID
              </Label>
              <Input
                id="upi-id"
                type="text"
                placeholder="yourname@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="bg-input border-border focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-input border-border focus:ring-ring"
                min="1"
                step="0.01"
              />
            </div>

            <Button
              onClick={generateQR}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        {qrValue && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">Your QR Code</CardTitle>
              <CardDescription>Scan this code to make payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg border border-border">
                <QRCodeSVG id="qr-code" value={qrValue} size={200} level="M" includeMargin={true} />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">UPI ID:</span> {upiId}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Amount:</span> ₹{amount}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadQR} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <Button onClick={shareQR} variant="outline" className="flex-1 bg-transparent">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Secure • Fast • Easy to use</p>
        </div>
      </div>
    </div>
  )
}
