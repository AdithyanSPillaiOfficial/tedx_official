"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import RightSide from "./RightSide";
import { IoIosAddCircleOutline, IoMdRemoveCircle } from "react-icons/io";
import { useSession, SessionContextValue } from "next-auth/react";
import Script from "next/script";
import showTedxToast from "@components/showTedxToast";

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  organisation: string;
}

export default function Content() {
  const { data: session, status } = useSession() as SessionContextValue;
  const [activeTab, setActiveTab] = useState<"individual" | "group">(
    "individual"
  );
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([
    { firstName: "", lastName: "", email: "", organisation: "" },
  ]);
  // const [orderId,setOrderId]=useState('');

  const individualPrice = 1200;
  const groupPrice = individualPrice; // Group price is the same as individual price initially

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const initialMember: Member = {
        firstName: (session.user as any).firstName || "",
        lastName: (session.user as any).lastName || "",
        email: session.user.email || "",
        organisation: (session.user as any).organisation || "",
      };

      if (activeTab === "individual") {
        setMembers([initialMember]);
      }
    }
  }, [session, status, activeTab]);

  const handleInputChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [name]: value };
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([
      ...members,
      { firstName: "", lastName: "", email: "", organisation: "" },
    ]);
  };

  const removeMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
  };

  const calculatePricing = () => {
    let subtotal = 0;
    let discount = 0;
    let total = 0;

    if (activeTab === "individual") {
      subtotal = individualPrice;
      total = subtotal;
    } else {
      const memberCount = members.length;
      subtotal = memberCount * groupPrice;

      if (memberCount >= 5 && memberCount <= 10) {
        discount = subtotal * 0.1; // 10% discount
      } else if (memberCount > 10) {
        discount = subtotal * 0.15; // 15% discount
      }

      total = subtotal - discount;
    }
    // setLastPrice(total);
    return { subtotal, discount, total };
  };

  const { subtotal, discount, total } = calculatePricing();

  const [count, setCount] = useState(1);
  const [lastPrice, setLastPrice] = useState(0);
  const [paymentId, setPaymentId] = useState("");

  //apit to create

  const handleBuy = async () => {
    try {
      // Create a new payment instance in Razorpay
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count: count,
          offer: discount,
          lastPrice: total,
        }),
      });
      const data = await response.json();
      console.log(data); // return the order id and the details of the payment
      var order_id;
      const options = {
        key: "rzp_test_PqOK3SguDXSVk6",
        amount: total * 100,
        currency: "INR",
        name: "TEDxCCET",
        image: "",
        description: "Payment for TEDxCCET",
        order_id: data.id,
        handler: async function (response: any) {
          console.log("Response=> ", response);
          showTedxToast({
            type: "success",
            message: "Payment Succesffull",
          });

          await fetch("/api/payment/validate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
            .then(async (res) => {
              await fetch("/api/payment/check", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: session?.user?._id,
                  count,
                  orderId: response.razorpay_order_id,
                  group: members,
                }),
              })
                .then((res) => {
                  console.log(res);
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
            });
        },
        prefill: {
          name: session?.user.firstName,
          email: session?.user.email,
        },
        theme: {
          color: "#d70000",
        },
      };
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      rzp1.open();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="px-[5vw] md:py-[5vh] lg:py-[5vh] py-2 flex md:flex-row lg:flex-row flex-col items-start justify-between min-h-[75vh] relative">
        <div className="flex-[2] w-full flex flex-col items-start justify-center gap-8">
          <div className="w-full items-center flex flex-col md:flex-row lg:flex-row justify-end">
            <div className="flex gap-2 items-center justify-center w-auto">
              <span className="text-xs md:text-base lg:text-base">
                powered by
              </span>
              <Image
                src={"/rpay.png"}
                alt=""
                height={1}
                width={100}
                className="w-[4rem] h-full md:w-[7rem] lg:w-[7rem]"
              />
            </div>
          </div>
          <div className="md:w-full lg:w-full flex items-center justify-center gap-8">
            <div
              className={`text-xs md:text-base lg:text-base relative cursor-pointer py-2 px-4 ${
                activeTab === "individual"
                  ? "text-primary-700"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("individual")}
            >
              Individual Ticket
              {activeTab === "individual" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-700"></div>
              )}
            </div>
            <div
              className={`relative text-xs md:text-base lg:text-base cursor-pointer py-2 px-4 ${
                activeTab === "group" ? "text-primary-700" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("group")}
            >
              Group Tickets
              {activeTab === "group" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-700"></div>
              )}
            </div>
          </div>
          <div className="w-full mt-4 transition-opacity duration-300 ease-in-out">
            {activeTab === "individual" && (
              <div className="opacity-100 flex flex-col gap-6">
                <div>
                  <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
                    <div className="flex-1">
                      <span className="font-light text-sm italic">
                        First Name
                      </span>
                      <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                        *
                      </span>
                      <input
                        type="text"
                        name="firstName"
                        value={members[0].firstName}
                        onChange={(e) => handleInputChange(0, e)}
                        className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                        placeholder="John"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-light text-sm italic">
                        Last Name
                      </span>
                      <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                        *
                      </span>
                      <input
                        type="text"
                        name="lastName"
                        value={members[0].lastName}
                        onChange={(e) => handleInputChange(0, e)}
                        className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
                    <div className="flex-1">
                      <span className="font-light text-sm italic">Email</span>
                      <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                        *
                      </span>
                      <input
                        type="text"
                        name="email"
                        value={members[0].email}
                        onChange={(e) => handleInputChange(0, e)}
                        className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                        placeholder="john@gmail.com"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="font-light text-sm italic">
                        Organisation
                      </span>
                      <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                        *
                      </span>
                      <input
                        type="text"
                        name="organisation"
                        value={members[0].organisation}
                        onChange={(e) => handleInputChange(0, e)}
                        className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                        placeholder="Company"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "group" && (
              <div className="opacity-100 flex flex-col gap-6">
                {members.map((member, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-bold">
                        Member {index + 1}
                      </span>
                      {index !== 0 && (
                        <IoMdRemoveCircle
                          className="cursor-pointer text-red-500"
                          size={24}
                          onClick={() => removeMember(index)}
                        />
                      )}
                    </div>
                    <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
                      <div className="flex-1">
                        <span className="font-light text-sm italic">
                          First Name
                        </span>
                        <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                          *
                        </span>
                        <input
                          type="text"
                          name="firstName"
                          value={member.firstName}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                          placeholder="John"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-light text-sm italic">
                          Last Name
                        </span>
                        <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                          *
                        </span>
                        <input
                          type="text"
                          name="lastName"
                          value={member.lastName}
                          onChange={(e) => handleInputChange(index, e)}
                          className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
                        <div className="flex-1">
                          <span className="font-light text-sm italic">
                            Email
                          </span>
                          <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                            *
                          </span>
                          <input
                            type="text"
                            name="email"
                            value={member.email}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                            placeholder="john@gmail.com"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="font-light text-sm italic">
                            Organisation
                          </span>
                          <span className="text-primary-700 text-2xl mt-[15px] font-semibold">
                            *
                          </span>
                          <input
                            type="text"
                            name="organisation"
                            value={member.organisation}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-full p-3 rounded-md bg-black-300 outline-none border-none"
                            placeholder="Company"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="w-full items-start justify-start flex">
                  <button
                    type="button"
                    className="text-primary-700 font-bold flex items-center justify-center gap-4 p-3 self-start"
                    onClick={addMember}
                  >
                    <IoIosAddCircleOutline size={24} /> Add another member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <RightSide
          activeTab={activeTab} // This should be either "individual" or "group"
          subtotal={subtotal}
          discount={discount}
          total={total}
          isChecked={isChecked} // This should be a boolean state
          setIsChecked={setIsChecked} // This should be a setter function for the isChecked state
          onBuy={handleBuy} // If your RightSide component doesn't have onBuy prop, remove it
        />
      </div>
    </>
  );
}