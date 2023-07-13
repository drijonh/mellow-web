
"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { guildStore } from "@/common/guilds";
import Highlight from "@/components/discord/Markdown";
import DiscordMessage from "@/components/discord/Message";
import DiscordMessageEmbed from "@/components/discord/MessageEmbed";
import ErrorBanner from "@/components/Error";
import MultiSelectMenu from "@/components/inputs/MultiSelectMenu";
import NumberInput from "@/components/inputs/NumberInput";
import SelectMenu from "@/components/inputs/SelectMenu";
import Switch from "@/components/inputs/Switch";
import { ApiV1GuildsModulesStarboardGetResponse, RouteErrorResponse } from "@/typings";

export default function Home() {
    const guild = guildStore((g) => g);

    const [error, setError] = useState<string>();
    const [starboard, setStarboard] = useState<ApiV1GuildsModulesStarboardGetResponse>();

    const [example, setExample] = useState({
        avatar: "https://cdn.waya.one/r/823554a71e92ca6192ab500d9b597a7f.png",
        username: "@spacewolf.",
        color: 0,
        emoji: ""
    });

    const params = useParams();

    useEffect(() => {
        handleUserStyle(starboard?.style || 0);

        fetch(`${process.env.NEXT_PUBLIC_API}/guilds/${params.guildId}/modules/starboard`, {
            headers: {
                authorization: localStorage.getItem("token") as string
            }
        })
            .then(async (res) => {
                const response = await res.json() as ApiV1GuildsModulesStarboardGetResponse;
                if (!response) return;

                switch (res.status) {
                    case 200: {
                        setStarboard(response);
                        break;
                    }
                    default: {
                        setStarboard(undefined);
                        setError((response as unknown as RouteErrorResponse).message);
                        break;
                    }
                }

            })
            .catch(() => {
                setError("Error while fetching starboard data");
            });

    }, []);

    const handleUserStyle = (value: number) => {
        // setStarboard((s) => {
        //     if (!s) return s;
        //     return {
        //         ...s,
        //         style: value
        //     };
        // });
        // switch (value) {
        //     case 0:
        //         setExample((e) => {
        //             return {
        //                 ...e,
        //                 avatar: "https://cdn.waya.one/r/823554a71e92ca6192ab500d9b597a7f.png",
        //                 username: "@spacewolf."
        //             };
        //         });
        //         break;
        //     case 1:
        //         setExample((e) => {
        //             return {
        //                 ...e,
        //                 avatar: "https://cdn.waya.one/r/823554a71e92ca6192ab500d9b597a7f.png",
        //                 username: "Space Wolf"
        //             };
        //         });
        //         break;
        //     case 2:
        //         setExample((e) => {
        //             return {
        //                 ...e,
        //                 avatar: "https://cdn.waya.one/r/823554a71e92ca6192ab500d9b597a7f.png",
        //                 username: "Luna’s Grandpa <3"
        //             };
        //         });
        //         break;
        //     case 3:
        //         setExample((e) => {
        //             return {
        //                 ...e,
        //                 avatar: "https://cdn.waya.one/r/a_3a2fa421f079827d31f4fd1b7a9971ba.gif",
        //                 username: "Luna’s Grandpa <3"
        //             };
        //         });
        //         break;
        // }
    };

    if (starboard === undefined) return (
        <div>
            {error && <ErrorBanner message={error} />}
        </div>
    );

    return (
        <div>

            <Switch
                name="Starboard module enabled."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="enabled"
                defaultState={starboard?.enabled || false}
                disabled={false}
            />

            <Switch
                name="Allow bots and webhooks."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="allowBots"
                defaultState={starboard?.allowBots || false}
                disabled={false}
            />

            <Switch
                name="Allow NSFW channels."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="allowNSFW"
                defaultState={starboard?.allowNSFW || false}
                disabled={false}
            />

            <Switch
                name="Allow message edits."
                description="If a message is being edited, update it in the starboard."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="allowEdits"
                defaultState={starboard?.allowEdits || false}
                disabled={false}
            />

            <Switch
                name="Allow author reaction."
                description="If a the message author can star their own messages."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="allowSelfReact"
                defaultState={starboard?.allowSelfReact || false}
                disabled={false}
            />

            <Switch
                name="Display stared message reference."
                description="Display the message the starboard message repleid to."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="displayReference"
                defaultState={starboard?.displayReference || false}
                disabled={false}
            />

            <Switch
                name="Delete message on reaction loose."
                description="If a message in the starboard looses the required reactions, it gets deleted."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="delete"
                defaultState={starboard?.delete || false}
                disabled={false}
            />

            <NumberInput
                name="How many reactions should be required."
                description="Amount of reactions with the emote are needed to get a message into the starboard."
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="requiredEmojis"
                defaultState={starboard?.requiredEmojis ?? 0}
                disabled={false}
                min={1}
            />

            <SelectMenu
                name="Channel"
                url={`/guilds/${guild?.id}/modules/starboard`}
                dataName="channelId"
                items={guild?.channels?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => { return { name: `#${c.name}`, value: c.id, error: c.missingPermissions.join(", ") }; })}
                description="Select the channel where the starboard messages should be send into."
                __defaultState={starboard?.channelId}
            />

            <div className="lg:flex gap-3">
                <div className="lg:w-1/2">
                    <SelectMenu
                        name="Emoji"
                        url={`/guilds/${guild?.id}/modules/starboard`}
                        dataName="emoji"
                        items={[
                            { icon: "⭐", name: "Star", value: "⭐" },
                            { icon: "✨", name: "Sparkles", value: "✨" },
                            ...guild?.emojis?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => {
                                return { icon: <Image src={`https://cdn.discordapp.com/emojis/${c.id}.webp?size=24&quality=lossless`} className="rounded-md" alt={c.name} height={24} width={24} />, name: c.name.replace(/-|_/g, " "), value: c.id };
                            }) || []
                        ]}
                        description="Select the emoji that needs to be reacted with."
                        __defaultState={starboard?.emoji}
                    />
                </div>

                <div className="lg:w-1/2">
                    <SelectMenu
                        name="Profile Display Style"
                        url={`/guilds/${guild?.id}/modules/starboard`}
                        dataName="style"
                        items={[
                            {
                                name: "Username",
                                value: 0
                            },
                            {
                                name: "Global Nickname",
                                value: 1
                            },
                            {
                                name: "Nickname",
                                value: 2
                            },
                            {
                                name: "Nickname & Per-guild Avatar",
                                value: 3
                            }
                        ]}
                        description="The style members profile gets displayed."
                        __defaultState={starboard?.style}
                        onSave={(options) => handleUserStyle(options.value as number)}
                    />
                </div>
            </div>

            <div className="lg:flex gap-3">
                <div className="lg:w-1/2">
                    <MultiSelectMenu
                        name="Blacklisted Roles"
                        url={`/guilds/${guild?.id}/modules/starboard`}
                        dataName="blacklistRoleIds"
                        items={guild?.roles?.sort((a, b) => b.position - a.position).map((r) => { return { name: `@${r.name}`, value: r.id, color: r.color }; })}
                        description="Select roles which should not be able to starboard."
                        defaultV={starboard?.blacklistRoleIds || []}
                        max={500}
                    />
                </div>

                <div className="lg:w-1/2">
                    <MultiSelectMenu
                        name="Blacklisted Channels"
                        url={`/guilds/${guild?.id}/modules/starboard`}
                        dataName="blacklistChannelIds"
                        items={guild?.channels?.sort((a, b) => a.name.localeCompare(b.name)).map((c) => { return { name: `#${c.name}`, value: c.id }; })}
                        description="Select channels which should not be able to be in the starboard."
                        defaultV={starboard?.blacklistChannelIds || []}
                        max={500}
                    />
                </div>
            </div>

            <div className="py-3 px-4 rounded-md mt-4" style={{ backgroundColor: "rgb(49, 51, 56)" }}>
                <DiscordMessage
                    mode={"DARK"}
                    user={{
                        username: "Wamellow",
                        avatar: "/waya-legacy1.png",
                        bot: true
                    }}
                >
                    <Highlight
                        mode={"DARK"}
                        text={""}
                    />

                    <DiscordMessageEmbed
                        author={{
                            icon_url: example.avatar,
                            text: example.username
                        }}
                        mode={"DARK"}
                        color={starboard.embedColor}
                    >
                        <div> I can imagine it now, a lunch break at Discord headquarters and a bunch of T&S staff talking to each other</div>
                        <div><strong>Staff 1:</strong> Hey did you get another ticket from that 2Lost4Discоrd guy?</div>
                        <div><strong>Staff 2:</strong> Yeah that guy really likes talking to us at this point, how about you did you get any of that Lunish one?</div>
                        <div><strong>Staff 1:</strong> Yeah I honestly gotten used to it at this point, we might need to issue a more detailed guide on using support when absolutely needed cause its getting ridiculous with those two.</div>
                        <div><strong>Staff 2:</strong> Tell me about it its like a routine on the shift.</div>

                        <br />

                        <span className="font-bold">{example.emoji} 9</span> | <span className="text-blue-500 hover:underline cursor-pointer">#・lounge</span>
                    </DiscordMessageEmbed>

                </DiscordMessage>
            </div>

        </div >
    );
}