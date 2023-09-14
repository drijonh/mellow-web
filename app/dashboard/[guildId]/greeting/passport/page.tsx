
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiFingerPrint } from "react-icons/hi";

import { guildStore } from "@/common/guilds";
import { CopyToClipboardButton } from "@/components/copyToClipboard";
import ErrorBanner from "@/components/Error";
import GoBack from "@/components/GoBack";
import SelectInput from "@/components/inputs/SelectMenu";
import Switch from "@/components/inputs/Switch";
import Modal from "@/components/Modal";
import OverviewLinkComponent from "@/components/OverviewLinkComponent";
import { ApiV1GuildsModulesPassportGetResponse, RouteErrorResponse } from "@/typings";
import { getCanonicalUrl } from "@/utils/urls";

export default function Home() {
    const guild = guildStore((g) => g);

    const [error, setError] = useState<string>();
    const [passport, setPassport] = useState<ApiV1GuildsModulesPassportGetResponse>();
    const [modal, setModal] = useState(false);
    const [punishmentRoleId, setPunishmentRoleId] = useState<string>();

    const params = useParams();

    useEffect(() => {

        fetch(`${process.env.NEXT_PUBLIC_API}/guilds/${params.guildId}/modules/passport`, {
            headers: {
                authorization: localStorage.getItem("token") as string
            }
        })
            .then(async (res) => {
                const response = await res.json() as ApiV1GuildsModulesPassportGetResponse;
                if (!response) return;

                switch (res.status) {
                    case 200: {
                        setPassport(response);
                        break;
                    }
                    default: {
                        setPassport(undefined);
                        setError((response as unknown as RouteErrorResponse).message);
                        break;
                    }
                }

            })
            .catch(() => {
                setError("Error while fetching passport data");
            });

    }, []);

    useEffect(() => {
        if (passport?.punishment === 2 && !passport.punishmentRoleId) setModal(true);
    }, [passport]);

    if (passport === undefined) return (
        <div>
            <GoBack url={`/dashboard/${guild?.id}/greeting`} />
            {error && <ErrorBanner message={error} />}
        </div>
    );

    return (
        <div>

            <GoBack url={`/dashboard/${guild?.id}/greeting`} />

            {passport.enabled && passport.punishment === 2 && !passport.punishmentRoleId && !modal &&
                <div className="mt-6">
                    <ErrorBanner type="info" message="When using 'Assign role to member', a punishment role must be set." removeButton />
                </div>
            }

            <Switch
                name="Passport module enabled."
                url={`/guilds/${guild?.id}/modules/passport`}
                dataName="enabled"
                defaultState={passport?.enabled || false}
                disabled={false}
                onSave={(s) => {
                    setPassport({
                        ...passport,
                        enabled: s
                    });
                }}
            />

            <Switch
                name="Send direct message to member on fail."
                url={`/guilds/${guild?.id}/modules/passport`}
                dataName="sendFailedDm"
                defaultState={passport?.sendFailedDm || false}
                disabled={!passport.enabled}
            />

            <SelectInput
                name="Logging channel"
                url={`/guilds/${guild?.id}/modules/passport`}
                dataName="channelId"
                items={guild?.channels?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => { return { name: `#${c.name}`, value: c.id, error: c.missingPermissions.join(", ") }; })}
                description="Select the channel where verifications should be send into."
                __defaultState={passport?.channelId}
                disabled={!passport.enabled}
            />

            <div className="lg:flex gap-3">
                <div className="lg:w-1/2">
                    <SelectInput
                        name="Unverified role"
                        url={`/guilds/${guild?.id}/modules/passport`}
                        dataName="unverifiedRoleId"
                        items={guild?.roles?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => { return { name: `#${c.name}`, value: c.id, error: c.missingPermissions.join(", ") }; })}
                        description="Select what role members should get when joining."
                        __defaultState={passport?.unverifiedRoleId}
                        disabled={!passport.enabled}
                    />
                </div>

                <div className="lg:w-1/2">
                    <SelectInput
                        name="Verified role"
                        url={`/guilds/${guild?.id}/modules/passport`}
                        dataName="successRoleId"
                        items={guild?.roles?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => { return { name: `#${c.name}`, value: c.id, error: c.missingPermissions.join(", ") }; })}
                        description="Select what role members should get when completing verification."
                        __defaultState={passport?.successRoleId}
                        disabled={!passport.enabled}
                    />
                </div>
            </div>

            <div className="lg:flex gap-3">
                <div className="lg:w-1/2">
                    <SelectInput
                        name="Failed verification action"
                        url={`/guilds/${guild?.id}/modules/passport`}
                        dataName="punishment"
                        items={[
                            { name: "Ban member", value: 0 },
                            { name: "Kick member", value: 1 },
                            { name: "Assign role to member", value: 2 }
                        ]}
                        description="Choose what should happen if a member failes verification."
                        __defaultState={passport?.punishment}
                        disabled={!passport.enabled}
                        onSave={(o) => {

                            setPassport({
                                ...passport,
                                punishment: o.value as ApiV1GuildsModulesPassportGetResponse["punishment"]
                            }); console.log(o.value);

                        }}
                    />
                </div>

                <Modal
                    title="Punishment role"
                    show={modal}
                    onClose={() => setModal(false)}
                    onSubmit={() => {
                        return fetch(`${process.env.NEXT_PUBLIC_API}/guilds/${guild?.id}/modules/passport`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                authorization: localStorage.getItem("token") as string
                            },
                            body: JSON.stringify({
                                punishmentRoleId: punishmentRoleId
                            })
                        });
                    }}
                    onSuccess={() => {
                        setPassport({
                            ...passport,
                            punishmentRoleId
                        });
                    }}
                >
                    <SelectInput
                        name="Role"
                        dataName="punishmentRoleId"
                        items={guild?.roles?.sort((a, b) => b.position - a.position).map((r) => { return { name: `@${r.name}`, value: r.id, error: r.missingPermissions.join(", "), color: r.color }; })}
                        description="Select what role members should get when failing verification."
                        __defaultState={passport.punishmentRoleId}
                        onSave={(o) => {
                            setPunishmentRoleId(o.value as string);
                        }}
                    />
                </Modal>

                <div className="lg:w-1/2">
                    <SelectInput
                        name="Punishment role"
                        url={`/guilds/${guild?.id}/modules/passport`}
                        dataName="punishmentRoleId"
                        items={guild?.roles?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => { return { name: `#${c.name}`, value: c.id, error: c.missingPermissions.filter((mp) => mp !== "EmbedLinks").join(", ") }; })}
                        description="Select what role members should get when failing verification."
                        __defaultState={passport?.punishmentRoleId}
                        disabled={!passport.enabled || passport.punishment !== 2}
                        onSave={(o) => {
                            setPassport({
                                ...passport,
                                punishment: o.value as ApiV1GuildsModulesPassportGetResponse["punishment"]
                            });
                        }}
                    />
                </div>
            </div>

            <OverviewLinkComponent
                className="mt-8"
                title="View Passport"
                message="Easily verify your members with a simple and secure CAPTCHA in the web."
                url={`/passport/${params.guildId}`}
                icon={<HiFingerPrint />}
            />

            <div className="w-fit">
                <CopyToClipboardButton title="Copy link to passport" text={getCanonicalUrl("passport", guild?.id as string)} />
            </div>

        </div>
    );
}